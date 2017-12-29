/**
 * Star.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    starId: 'number',

    name: 'string',

    luminosity: 'number',

    radius: 'number',

    spectralClass: 'string',

    temperature: 'number',

    system: {
      model: 'system'
    },

    type: {
      model: 'type'
    }

  }
};

