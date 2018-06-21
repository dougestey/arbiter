/**
 * Stat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    shipJumps: 'number',

    shipKills: 'number',

    podKills: 'number',

    npcKills: 'number',

    // Relationships

    system: { model: 'system', required: true },

  }

};
