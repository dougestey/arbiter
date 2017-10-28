// Originally we used eve-swagger but had some weird issues
// coming up in stats (possibly due to old endpoints.)
let esi = require('eve-swagger-simple');

module.exports = {

  initialize: function() {
    sails.log.debug('[Swagger.initialize] Running');
    return esi.request('/universe/systems', {
      datasource: 'tranquility',
    })
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
    return esi.request('/universe/system_kills', {
      datasource: 'tranquility',
    })
    .then((systems) => {
      sails.log.debug('[Swagger.updateKills] Got response from ESI, ' + systems.length + ' total.');

      let fn = function(system) {
        sails.log.debug('[Swagger.updateKills] Updating: ', system);
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
    return esi.request('/universe/system_jumps', {
      datasource: 'tranquility',
    })
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
