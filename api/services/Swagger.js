// Originally we used eve-swagger but had some weird issues
// coming up in stats (possibly due to old endpoints.)
let ESI = require('eve-swagger-simple');

module.exports = {

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

    if (!localStargate || localStargate.name) {
      let stargate = await ESI.request(`/universe/stargates/${stargateId}`),
          { id: toStargate } = await Stargate.findOrCreate({ stargateId: stargate.destination.stargate_id }),
          { id: toSystem } = await System.findOrCreate({ systemId: stargate.destination.system_id }),
          { id: type } = await Type.findOrCreate({ typeId: stargate.type_id });

      await Stargate.update({ stargateId }, {
        name: stargate.name,
        position: stargate.position,
        toStargate,
        toSystem,
        type
      });
    }

    localStargate = await Stargate.findOne({ stargateId })
      .populate('system');

    return localStargate;
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
