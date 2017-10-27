/**
 * System.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    systemId: { type: 'integer' },
    name: { type: 'string' },
    position: { type: 'json' },
    securityStatus: { type: 'float' },
    securityClass: { type: 'string' },

    shipJumps: { type: 'integer' },
    shipKills: { type: 'integer' },
    podKills: { type: 'integer' },
    npcKills: { type: 'integer' },    

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

