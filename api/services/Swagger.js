/**
 * Swagger
 *
 * @description :: The gateway to ESI.
 * @help        :: https://esi.tech.ccp.is/ui/
 */

// TODO: This service is getting far too big and will need to be segmented out.

// Originally we used eve-swagger but had some weird issues
// coming up in stats (possibly due to old endpoints.)
const ESI_AUTH_URL = 'https://login.eveonline.com/oauth/token';

let ESI = require('eve-swagger-simple'),
    request = require('request'),
    qs = require('qs'),
    client_id = process.env.ESI_CLIENT_ID,
    client_secret = process.env.ESI_CLIENT_SECRET;

let constellationStats = {};
let regionStats = {};

let _serializeStats = async({ id }) => {
  let stats = await Stat.find({ system: id }).sort('createdAt DESC').limit(2);

  let npcKills = 0,
      shipKills = 0,
      podKills = 0,
      shipJumps = 0,
      createdAt;

  if (stats.length) {
    for (let stat of stats) {
      if (stat.npcKills) {
        npcKills = stat.npcKills;
      }

      if (stat.shipKills) {
        shipKills = stat.shipKills;
      }

      if (stat.podKills) {
        podKills = stat.podKills;
      }

      if (stat.shipJumps) {
        shipJumps = stat.shipJumps;
      }

      if (stat.createdAt) {
        createdAt = stat.createdAt;
      }
    }
  } else {
    // If we have no stats, it means ESI never returned them - which means they're all 0.
    let stat = await Stat.find().sort('createdAt DESC').limit(1);

    createdAt = stat.createdAt;
  }

  return { npcKills, shipKills, podKills, shipJumps, createdAt };
};

let _buildConstellations = async() => {
  let constellations = await Constellation.find();

  sails.log.debug(`[Swagger.updateStats] Building ${constellations.length} constellations...`);

  for (let constellation of constellations) {
    constellationStats[constellation.id] = {
      shipKills: 0,
      npcKills: 0,
      podKills: 0,
      shipJumps: 0,
      constellation: constellation.id
    };
  };
};

let _buildRegions = async() => {
  let regions = await Region.find();

  sails.log.debug(`[Swagger.updateStats] Building ${regions.length} regions...`);

  for (let region of regions) {
    regionStats[region.id] = {
      shipKills: 0,
      npcKills: 0,
      podKills: 0,
      shipJumps: 0,
      region: region.id
    };
  };
};

let _updateSystems = async() => {
  sails.log.debug(`[Swagger.updateStats] Systems publish...`);

  let systems = await System.find();

  for (let system of systems) {
    system.stats = await _serializeStats(system);

    System.publish([system.id], system);
  }
};

let _updateConstellations = async() => {
  sails.log.debug(`[Swagger.updateStats] Constellations publish...`);

  for (let stat in constellationStats) {
    let statRecord = await Stat.create(constellationStats[stat]).fetch();
    let constellation = await Constellation.findOne(constellationStats[stat].constellation);
    
    constellation.systems = await System.find({ constellation: constellation.id });
    constellation.stats = statRecord;

    Constellation.publish([constellationStats[stat].constellation], constellation);
  };
};

let _updateRegions = async() => {
  sails.log.debug(`[Swagger.updateStats] Regions publish...`);

  for (let stat in regionStats) {
    let statRecord = await Stat.create(regionStats[stat]).fetch();
    let region = await Region.findOne(regionStats[stat].region);

    region.stats = statRecord;
    region.systems = await System.find({ region: region.id });

    Region.publish([regionStats[stat].region], region);
  };
};

module.exports = {

  async refresh(token) {
    return new Promise((resolve, reject) => {
      request({
        url: ESI_AUTH_URL,
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Host': 'login.eveonline.com'
        },
        body: qs.stringify({
          'grant_type': 'refresh_token',
          'refresh_token': token
        }),
        json: true
      }, (error, response, body) => {
        if (error) {
          sails.log.error(error);
          return reject(error);
        }

        return resolve(body);
      });
    });
  },

  async updateStats() {
    let kills = await ESI.request('/universe/system_kills');
    let jumps = await ESI.request('/universe/system_jumps');

    await _buildConstellations();
    await _buildRegions();

    sails.log.debug(`[Swagger.updateStats] Updating kills for ${kills.length} systems...`);

    for (let system of kills) {
      let localSystem = await System.findOne(system.system_id);

      await Stat.create({
        shipKills: system.ship_kills,
        npcKills: system.npc_kills,
        podKills: system.pod_kills,
        system: system.system_id
      });

      constellationStats[localSystem.constellation].shipKills = constellationStats[localSystem.constellation].shipKills + system.ship_kills;
      constellationStats[localSystem.constellation].npcKills = constellationStats[localSystem.constellation].npcKills + system.npc_kills;
      constellationStats[localSystem.constellation].podKills = constellationStats[localSystem.constellation].podKills + system.pod_kills;

      regionStats[localSystem.region].shipKills = regionStats[localSystem.region].shipKills + system.ship_kills;
      regionStats[localSystem.region].npcKills = regionStats[localSystem.region].npcKills + system.npc_kills;
      regionStats[localSystem.region].podKills = regionStats[localSystem.region].podKills + system.pod_kills;
    };

    sails.log.debug(`[Swagger.updateStats] Updating jumps for ${jumps.length} systems...`);

    for (let system of jumps) {
      let localSystem = await System.findOne(system.system_id);

      await Stat.create({
        shipJumps: system.ship_jumps,
        system: system.system_id
      }).fetch();

      constellationStats[localSystem.constellation].shipJumps = constellationStats[localSystem.constellation].shipJumps + system.ship_jumps;

      regionStats[localSystem.region].shipJumps = regionStats[localSystem.region].shipJumps + system.ship_jumps;
    };

    await _updateRegions();
    await _updateConstellations();
    await _updateSystems();

    return;
  },

  async route(origin, destination) {
    let route = await ESI.request(`/route/${origin}/${destination}`);

    return route;
  },

  async corporation(id, allianceRecord) {
    if (!id)
      return;

    let localCorporation = await Corporation.findOne(id);

    if (!localCorporation) {
      let {
        name,
        ticker,
        member_count: memberCount
      } = await ESI.request(`/corporations/${id}`);

      localCorporation = await Corporation.create({
        id,
        name,
        ticker,
        memberCount,
        alliance: allianceRecord ? allianceRecord.id : null
      })
      .intercept('E_UNIQUE', (e) => { return new Error(`Tried to create a corp that already exists. ${e}`) })
      .fetch();
    }

    return localCorporation;
  },

  async alliance(id) {
    if (!id)
      return;

    let localAlliance = await Alliance.findOne(id);

    if (!localAlliance || !localAlliance.name) {
      let { name, ticker } = await ESI.request(`/alliances/${id}`);

      if (!localAlliance) {
        localAlliance = await Alliance.create({ id, name, ticker })
        .intercept('E_UNIQUE', (e) => { return new Error(`Tried to create an alliance that already exists. ${e}`) })
        .fetch();
      } else {
        localAlliance = await Alliance.update(id, { name, ticker }).fetch();
        localAlliance = _.first(localAlliance);
      }
    }

    return localAlliance;
  },

  /**

     Forced Calls
     ============

     Usually because we want latest data

  **/

  characterPublic(characterId) {
    return ESI.request(`/characters/${characterId}`);
  },

  async characterPrivate(character_id, token, refresh_token) {
    let _successfullyUpdateTokens = async() => {
      let newTokens;

      try {
        newTokens = await this.refresh(refresh_token);
      } catch (e) {
        sails.log.error(`ESI rejected our request for new tokens, force user to re-auth.`);
        return false;
      }

      let { access_token: accessToken, refresh_token: refreshToken } = newTokens;

      if (!accessToken || !refreshToken) {
        sails.log.error(`ESI didn't error out, but didn't pass us new tokens.`);
        return false;
      }

      await Character.update(character_id, { accessToken, refreshToken });

      token = accessToken;
      refresh_token = refreshToken;

      return true;
    };

    // TODO: Holy shit this whole flow sucks. There has to be a better way.
    let location, ship, online;

    try {
      location = await this.characterLocation(character_id, token);
    } catch(e) {
      let refreshed = await _successfullyUpdateTokens();

      if (!refreshed) {
        return new Error(`Couldn't update location, please re-auth.`);
      }

      location = await this.characterLocation(character_id, token);
    }

    try {
      ship = await this.characterShip(character_id, token);
    } catch(e) {
      let refreshed = await _successfullyUpdateTokens();

      if (!refreshed) {
        return new Error(`Couldn't update ship, please re-auth.`);
      }

      ship = await this.characterShip(character_id, token);
    }

    try {
      online = await this.characterOnline(character_id, token);
    } catch(e) {
      let refreshed = await _successfullyUpdateTokens();

      if (!refreshed) {
        return new Error(`Couldn't update online status, please re-auth.`);
      }

      online = await this.characterOnline(character_id, token);
    }

    return { location, ship, online };
  },

  characterLocation(character_id, token) {
    return ESI.request(`/characters/${character_id}/location`, { character_id, token });
  },

  characterShip(character_id, token) {
    return ESI.request(`/characters/${character_id}/ship`, { character_id, token });
  },

  characterOnline(character_id, token) {
    return ESI.request(`/characters/${character_id}/online`, { character_id, token });
  }

};
