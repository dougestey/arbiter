/**
 * THIS FILE WAS ADDED AUTOMATICALLY by the Sails 1.0 app migration tool.
 */

module.exports.datastores = {

  // In previous versions, datastores (then called 'connections') would only be loaded
  // if a model was actually using them.  Starting with Sails 1.0, _all_ configured
  // datastores will be loaded, regardless of use.  So we'll only include datastores in
  // this file that were actually being used.  Your original `connections` config is
  // still available as `config/connections-old.js.txt`.

  /***************************************************************************
  *                                                                          *
  * MongoDB is the leading NoSQL database.                                   *
  * http://en.wikipedia.org/wiki/MongoDB                                     *
  *                                                                          *
  * Run: npm install sails-mongo                                             *
  *                                                                          *
  ***************************************************************************/
  arbiter: {
    adapter: 'sails-postgresql',
    host: '127.0.0.1',
    port: 5432,
    database: 'arbiter',
    user: 'arbiter',
    password: 'arbiter'
  },

  arbiterDev: {
    adapter: 'sails-postgresql',
    host: '127.0.0.1',
    port: 5432,
    database: 'arbiter_dev',
    user: 'arbiter',
    password: 'arbiter'
  },

  sde: {
    adapter: 'sails-postgresql',
    host: '127.0.0.1',
    port: 5432,
    database: 'eve',
    user: 'eve',
    password: 'eve'
  }

};
