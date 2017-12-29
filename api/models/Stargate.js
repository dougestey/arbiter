/**
 * Stargate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    stargateId: 'number',

    name: 'string',

    position: 'json',

    toStargate: {
      model: 'stargate'
    },

    toSystem: {
      model: 'system'
    },

    type: {
      model: 'type'
    },

    system: {
      model: 'system'
    }

  }
};

