// The main module returns a default Api instance with an attached
// Api constructor if configuration changes are necessary.
let esi = require('eve-swagger');

// Creating a new Api instance with a different configuration.
// All options, with their default values, are shown below.
let esi2 = esi({
    service: 'https://esi.tech.ccp.is',
    source: 'tranquility',
    agent: 'ascent | https://github.com/dougestey/ascent',
    language: 'en-us',
    timeout: 6000,
    minTime: 0,
    maxConcurrent: 0
  });

module.exports = {

  initialize: function() {
    sails.log.debug('[Swagger.initialize] Running');
    return esi.solarSystems.all()
      .then((systems) => {
        sails.log.debug('[Swagger.initialize] Got response from ESI, ' + systems.length + ' total.');

        let fn = function(system) {
          sails.log.debug('[Swagger.initialize] Looking up: ' + system);

          return System.findOrCreate({ systemId: system }, {
            systemId: system
          }).then((created) => {
            sails.log.debug('[Swagger.initialize] Created or found: ' + created.systemId);

            return created;
          }, (error) => {
            sails.log.error(error);
          });
        };

        let resolvedSystems = systems.map(fn);

        return Promise.all(resolvedSystems)
          .then((systems) => {
            sails.log.debug('[Swagger.initialize] Done. Returned ' + systems.length);
            return systems;
          });
      });
  },

  updateKills: function() {
    sails.log.debug('[Swagger.updateKills] Running');
    return esi.solarSystems.killStats()
      .then((systems) => {
        sails.log.debug('[Swagger.updateKills] Got response from ESI, ' + systems.length + ' total.');

        let fn = function(system) {
          sails.log.debug('[Swagger.updateKills] Updating: ' + system.system_id);
          return System.update({ systemId: system.system_id }, {
            shipKills: system.ship_kills,
            npcKills: system.npc_kills,
            podKills: system.pod_kills
          }).then((updated) => {
            return updated;
          }, (error) => {
            sails.log.error(error);
          });
        };

        let resolvedSystems = systems.map(fn);

        return Promise.all(resolvedSystems)
          .then((systems) => {
            sails.log.debug('[Swagger.updateKills] Done. Returned ' + systems.length);
            return systems;
          });
      });
  },

  updateJumps: function() {
    sails.log.debug('[Swagger.updateJumps] Running');
    return esi.solarSystems.jumpStats()
      .then((systems) => {
        sails.log.debug('[Swagger.updateJumps] Got response from ESI, ' + systems.length + ' total.');

        let fn = function(system) {
          sails.log.debug('[Swagger.updateJumps] Updating: ' + system.system_id);          
          return System.update({ systemId: system.system_id }, {
            shipJumps: system.ship_jumps
          }).then((updated) => {
            return updated;
          }, (error) => {
            sails.log.error(error);
          });
        };

        let resolvedSystems = systems.map(fn);

        return Promise.all(resolvedSystems)
          .then((systems) => {
            sails.log.debug('[Swagger.updateJumps] Done. Returned ' + systems.length);
            return systems;
          });
      });  
  }

};
