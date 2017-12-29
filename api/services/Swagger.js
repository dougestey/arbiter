// Originally we used eve-swagger but had some weird issues
// coming up in stats (possibly due to old endpoints.)
let esi = require('eve-swagger-simple');

module.exports = {

  async initialize() {
    sails.log.debug('[Swagger.initialize] Running');

    let systems = await esi.request('/universe/systems');

    sails.log.debug('[Swagger.initialize] Got response from ESI, ' + systems.length + ' total.');

    let fn = async function(systemId) {
      sails.log.debug('[Swagger.initialize] Looking up: ' + systemId);

      let createdSystem = await System.findOrCreate({ systemId }, { systemId });

      sails.log.debug('[Swagger.initialize] Created or found: ' + createdSystem.systemId);
    };

    let resolvedSystems = await Promise.all(systems.map(fn));

    sails.log.debug('[Swagger.initialize] Done. Returned ' + resolvedSystems.length);

    return resolvedSystems;
  },

  async updateKills() {
    sails.log.debug('[Swagger.updateKills] Running');

    let systems = await esi.request('/universe/system_kills');

    sails.log.debug('[Swagger.updateKills] Got response from ESI, ' + systems.length + ' total.');

    let fn = async function(system) {
      sails.log.debug('[Swagger.updateKills] Updating: ', system);

      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipKills: system.ship_kills,
        npcKills: system.npc_kills,
        podKills: system.pod_kills
      });

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn))

    sails.log.debug('[Swagger.updateKills] Done. Returned ' + updatedSystems.length);

    return updatedSystems;
  },

  async updateJumps() {
    sails.log.debug('[Swagger.updateJumps] Running');

    let systems = await esi.request('/universe/system_jumps');

    sails.log.debug('[Swagger.updateJumps] Got response from ESI, ' + systems.length + ' total.');

    let fn = async function(system) {
      sails.log.debug('[Swagger.updateJumps] Updating: ', system);

      let updatedSystem = await System.update({ systemId: system.system_id }, {
        shipJumps: system.ship_jumps
      });

      return updatedSystem;
    };

    let updatedSystems = await Promise.all(systems.map(fn))

    sails.log.debug('[Swagger.updateJumps] Done. Returned ' + updatedSystems.length);

    return updatedSystems;
  },

  async system(systemId) {
    let localSystem = await System.findOne({ systemId });

    if (!localSystem)
      return;

    if (!localSystem.name) {
      let system = await esi.request(`/universe/systems/${systemId}`);

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
  }
};
