/**
 * AuthController
 *
 * @description :: Server-side logic for managing EVE SSO
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var eveSso = require('eve-sso-simple');

var client_id = process.env.ESI_CLIENT_ID;
var client_secret = process.env.ESI_CLIENT_SECRET;

module.exports = {
  
  authorize: function(req, res) {
    return eveSso.login({
      client_id,
      client_secret,
      redirect_uri: 'http://arbiter/auth/complete',
      scope: 'esi-location.read_location.v1'
    }, res);
  },

  token: function(req, res) {
    return eveSso.getTokens({
      client_id,
      client_secret,
    }, req, res, (accessToken, charToken) => {
      res.status(200).json({
        access_token: accessToken, 
        character_token: charToken
      })
    });
  }
  
};
