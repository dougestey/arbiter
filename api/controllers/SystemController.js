/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  name: attr('string'),
  position: attr('json'),
  securityStatus: attr('float'),
  securityClass: attr('string'),

  constellation: {
    model: 'constellation'
  },

  stargates: {
    collection: 'stargate',
    via: 'system'
  },

  planets: {
    collection: 'planet',
    via: 'system'
  }

};
