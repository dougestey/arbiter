/**
 * Stat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    shipJumps: { type: 'number', allowNull: true },

    shipKills: { type: 'number', allowNull: true },

    podKills: { type: 'number', allowNull: true },

    npcKills: { type: 'number', allowNull: true },

    // Relationships

    system: { model: 'system' },

    constellation: { model: 'constellation' },

    region: { model: 'region' },

  }

};
