/**
 * Kill.js
 *
 * @description :: Kill report as retrieved from the zKill/Push service.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  datastore: 'arbiter_zkill',

  attributes: {

    killId: 'number',

    killMail: 'json',

    meta: 'json'

  }

};

