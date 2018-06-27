/**
 * System.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'sde',

  tableName: 'mapSolarSystems',

  attributes: {

    id: { columnName: 'solarSystemID', type: 'number', autoIncrement: false, required: true },

    name: { columnName: 'solarSystemName', type: 'string' },

    securityStatus: { columnName: 'security', type: 'number' },

    // Relationships

    constellation: { columnName: 'constellationID', model: 'constellation' },

    region: { columnName: 'regionID', model: 'region' },

  }
};
