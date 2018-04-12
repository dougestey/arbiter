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
        })
      }, (error, response, body) => {
        if (error) {
          sails.log.error(error);
          return reject(error);
        }

        resolve(JSON.parse(body));
      });
    });
  },

  async initialize() {
    let systems = await ESI.request('/universe/systems'),
        fn = async function(systemId) {
          await System.findOrCreate({ systemId }, { systemId });
        };

    let resolvedSystems = await Promise.all(systems.map(fn));

    return resolvedSystems;
  },

  async updateKills() {
    let systems = await ESI.request('/universe/system_kills');

    sails.log.debug(`[Swagger.updateKills] Updating ${systems.length} systems...`);

    let fn = async function(system) {
      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipKills: system.ship_kills,
        npcKills: system.npc_kills,
        podKills: system.pod_kills
      }).fetch();

      System.publish([updatedSystem[0].id], updatedSystem[0]);

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn));

    sails.log.debug(`[Swagger.updateKills] Done.`);

    return updatedSystems;
  },

  async updateJumps() {
    let systems = await ESI.request('/universe/system_jumps');

    sails.log.debug(`[Swagger.updateJumps] Updating ${systems.length} systems...`);

    let fn = async function(system) {
      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipJumps: system.ship_jumps
      }).fetch();

      System.publish([updatedSystem[0].id], updatedSystem[0]);

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn));

    sails.log.debug(`[Swagger.updateJumps] Done.`);

    return updatedSystems;
  },

  async type(typeId) {
    if (!typeId)
      return;

    let localType = await Type.findOne({ typeId });

    if (!localType) {
      let { name } = await ESI.request(`/universe/types/${typeId}`);

      localType = await Type.create({
        typeId,
        name
      })
      .intercept('E_UNIQUE', (e) => { return new Error(`Tried to create a type that already exists. ${e}`) })
      .fetch();
    }

    return localType;
  },

  async system(systemId) {
    if (!systemId)
      return;

    let localSystem = await System.findOne({ systemId });

    if (!localSystem)
      return;

    // TODO: Improve this check
    if (!localSystem.name) {
      let system = await ESI.request(`/universe/systems/${systemId}`);

      localSystem = await System.update({ systemId }, {
        name: system.name,
        position: system.position,
        securityStatus: system.security_status,
        securityClass: system.security_class
      }).fetch();

      localSystem = _.first(localSystem);
    }

    return localSystem;
  },

  async corporation(corporationId, allianceRecord) {
    if (!corporationId)
      return;

    let localCorporation = await Corporation.findOne({ corporationId });

    if (!localCorporation) {
      let { name,
            ticker,
            member_count: memberCount
          } = await ESI.request(`/corporations/${corporationId}`);

      localCorporation = await Corporation.create({
        corporationId,
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

  async alliance(allianceId) {
    if (!allianceId)
      return;

    let localAlliance = await Alliance.findOne({ allianceId });

    if (!localAlliance || !localAlliance.name) {
      let { name, ticker } = await ESI.request(`/alliances/${allianceId}`);

      if (!localAlliance) {
        localAlliance = await Alliance.create({ allianceId, name, ticker })
        .intercept('E_UNIQUE', (e) => { return new Error(`Tried to create an alliance that already exists. ${e}`) })
        .fetch();
      } else {
        localAlliance = await Alliance.update({ allianceId }, { name, ticker }).fetch();
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

      await Character.update({ characterId: character_id }, { accessToken, refreshToken });

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
