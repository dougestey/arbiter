/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    groupId: 'number',

    name: 'string',

    published: 'boolean',

    category: {
      model: 'category'
    },

    types: {
      collection: 'type',
      via: 'group'
    }

  }
};

