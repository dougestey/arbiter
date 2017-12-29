/**
 * Planet.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    planetId: 'number',

    name: 'string',

    position: 'json',

    type: {
      model: 'type'
    },

    moons: {
      collection: 'moon',
      via: 'planet'
    },

    system: {
      model: 'system'
    }

  }
};
