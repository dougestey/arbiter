/**
 * Constellation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    constellationId: { type: 'number', unique: true },

    name: 'string',

    position: 'json',

    // Relationships

    // region: { model: 'region' },

    // systems: { collection: 'system', via: 'constellation' }

  }
};
