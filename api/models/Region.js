/**
 * Region.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    regionId: { type: 'number', unique: true },

    name: 'string',

    description: 'string',

    // Relationships

    // constellations: { collection: 'constellation', via: 'region' }

  }
};

