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
  }
};
