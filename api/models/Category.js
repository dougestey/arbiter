/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    categoryId: { type: 'number', unique: true },

    name: 'string',

    published: 'boolean',

    // Relationships

    groups: { collection: 'group', via: 'category' }

  }
};
