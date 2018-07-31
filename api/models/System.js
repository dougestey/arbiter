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

    createdAt: false,

    updatedAt: false,

    id: {
      columnName: 'solarSystemID',
      type: 'number',
      autoIncrement: false,
      required: true
    },

    name: { columnName: 'solarSystemName', type: 'string' },

    securityStatus: { columnName: 'security', type: 'number' },

    x: { columnType: 'decimal', type: 'number' },

    y: { columnType: 'decimal', type: 'number' },

    z: { columnType: 'decimal', type: 'number' },

    // Relationships

    constellation: { columnName: 'constellationID', model: 'constellation' },

    region: { columnName: 'regionID', model: 'region' },

  }
};
