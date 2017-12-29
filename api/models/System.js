/**
 * System.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    systemId: { type: 'number' },
    name: { type: 'string' },
    position: { type: 'json' },
    securityStatus: { type: 'number' },
    securityClass: { type: 'string' },

    shipJumps: { type: 'number' },
    shipKills: { type: 'number' },
    podKills: { type: 'number' },
    npcKills: { type: 'number' },    

    constellation: {
      model: 'constellation'
    },

    stargates: {
      collection: 'stargate',
      via: 'system'
    },

    planets: {
      collection: 'planet',
      via: 'system'
    }

  }
};

