/**
 * System.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    systemId: { type: 'number', unique: true },

    name: 'string',

    position: 'json',

    securityStatus: 'number',

    securityClass: 'string',

    shipJumps: 'number',

    shipKills: 'number',

    podKills: 'number',

    npcKills: 'number',

    // Relationships

    constellation: { model: 'constellation' }

  }
};
