/**
 * System.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    systemId: 'number',

    name: 'string',

    position: 'json',

    securityStatus: 'number',

    securityClass: 'string',

    shipJumps: 'number',

    shipKills: 'number',

    podKills: 'number',

    npcKills: 'number',

    star: {
      model: 'star'
    },

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
    },

    moons: {
      collection: 'moon',
      via: 'system'
    }

  }
};

