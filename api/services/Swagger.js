// Originally we used eve-swagger but had some weird issues
// coming up in stats (possibly due to old endpoints.)
let ESI = require('eve-swagger-simple'),
    request = require('request'),
    qs = require('qs'),
    client_id = process.env.ESI_CLIENT_ID,
    client_secret = process.env.ESI_CLIENT_SECRET;

module.exports = {

  async refresh(token) {
    return new Promise((resolve, reject) => {
      request({
        url: 'https://login.eveonline.com/oauth/token',
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
          console.log(error);
          reject(error);
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

    let fn = async function(system) {
      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipKills: system.ship_kills,
        npcKills: system.npc_kills,
        podKills: system.pod_kills
      });

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn))

    return updatedSystems;
  },

  async updateJumps() {
    let systems = await ESI.request('/universe/system_jumps');

    let fn = async function(system) {
      sails.log.debug('[Swagger.updateJumps] Updating: ', system);

      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipJumps: system.ship_jumps
      });

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn))

    return updatedSystems;
  },

  async type(typeId) {
    let localType = await Type.findOne({ typeId }), type;

    if (!localType) {
      let { name, description, published } = await ESI.request(`/universe/types/${typeId}`);

      await Type.create({
        typeId,
        name,
        description,
        published
      });
    } else if (!localType.name) {
      let { name, description, published } = await ESI.request(`/universe/types/${typeId}`);

      await Type.update({ typeId }, {
        typeId,
        name,
        description,
        published
      });
    }

    localType = await Type.findOne({ typeId });

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

      let moonFn = async function(planet, localPlanet) {
        let fn = async function(moonId) {
          await Moon.findOrCreate({ moonId }, { moonId, planet: localPlanet.id, system: localSystem.id });
        };

        return Promise.all(planet.moons.map(fn));
      };

      let planetFn = async function(system) {
        let fn = async function(planet) {
          let planetId = planet.planet_id;

          let localPlanet = await Planet.findOrCreate({ planetId }, { planetId, system: localSystem.id });

          if (planet.moons)
            await moonFn(planet, localPlanet);
        };

        return Promise.all(system.planets.map(fn));
      };

      let stargateFn = async function(system) {
        let fn = async function(stargateId) {
          await Stargate.findOrCreate({ stargateId }, { stargateId, system: localSystem.id });
        };

        return Promise.all(system.stargates.map(fn));
      };

      let constellation, star;

      if (system.planets)
       await planetFn(system);
      
      if (system.stargates)
        await stargateFn(system);

      if (system.constellation_id) {
        constellation = await Constellation.findOrCreate({
          constellationId: system.constellation_id
        }, {
          constellationId: system.constellation_id
        });
      }

      if (system.star_id) {
        star = await Star.findOrCreate({
          starId: system.star_id
        }, {
          starId: system.star_id
        });
      }
  
      await System.update({ systemId }, {
        name: system.name,
        position: system.position,
        securityStatus: system.security_status,
        securityClass: system.security_class,
        constellation: constellation.id,
        star: star.id
      });
    }

    localSystem = await System.findOne({ systemId })
        .populate('planets')
        .populate('moons')
        .populate('constellation')
        .populate('star')
        .populate('stargates');

    return localSystem;
  },

  async stargate(stargateId) {
    let localStargate = await Stargate.findOne({ stargateId });

    if (!localStargate || !localStargate.name) {
      let stargate = await ESI.request(`/universe/stargates/${stargateId}`),
          { id: toStargate } = await Stargate.findOrCreate({ stargateId: stargate.destination.stargate_id }),
          { id: toSystem } = await System.findOrCreate({ systemId: stargate.destination.system_id }),
          { id: type } = await Type.findOrCreate({ typeId: stargate.type_id });
      
      if (!localStargate) {
        await Stargate.create({
          stargateId,
          name: stargate.name,
          position: stargate.position,
          toStargate,
          toSystem,
          type
        });
      } else {
        await Stargate.update({ stargateId }, {
          name: stargate.name,
          position: stargate.position,
          toStargate,
          toSystem,
          type
        });
      }
    }

    localStargate = await Stargate.findOne({ stargateId })
      .populate('system');

    return localStargate;
  },

  async corporation(corporationId) {
    let localCorporation = await Corporation.findOne({ corporationId });

    if (!localCorporation) {
      let { name,
            ticker,
            member_count: memberCount,
            alliance_id: allianceId
          } = await ESI.request(`/corporations/${corporationId}`),
          alliance;

      if (allianceId)
        alliance = await Alliance.findOrCreate({ allianceId }, { allianceId });

      localCorporation = await Corporation.create({
        corporationId,
        name,
        ticker,
        memberCount,
        alliance: alliance.id
      });
    }

    return localCorporation;
  },

  async alliance(allianceId) {
    let localAlliance = await Alliance.findOne({ allianceId });

    if (!localAlliance || !localAlliance.name) {
      let { name, ticker } = await ESI.request(`/alliances/${allianceId}`);

      if (!localAlliance)
        localAlliance = await Alliance.create({ allianceId, name, ticker });

      if (!localAlliance.name)
        localAlliance = await Alliance.update({ allianceId }, { name, ticker }).fetch();
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
    let _updateTokens = async() => {
      let { access_token: accessToken, refresh_token: refreshToken } = await this.refresh(refresh_token);

      if (!accessToken || !refreshToken)
        return console.error('ESI rejected our request for new tokens. Not good.');

      await Character.update({ characterId: character_id }, { accessToken, refreshToken });

      token = accessToken;
      refresh_token = refreshToken;

      return;
    };

    // TODO: Holy shit this whole flow sucks. There has to be a better way.
    let location = await this.characterLocation(character_id, token);

    if (location.error) {
      await _updateTokens();
      location = await this.characterLocation(character_id, token);
    }

    let ship = await this.characterShip(character_id, token);

    if (ship.error) {
      await _updateTokens();
      ship = await this.characterLocation(character_id, token);
    }

    let online = await this.characterOnline(character_id, token);

    if (online.error) {
      await _updateTokens();
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
