/**
 * AuthController
 *
 * @description :: EVE SSO
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let SSO = require('eve-sso-simple'),
    client_id = process.env.ESI_CLIENT_ID,
    client_secret = process.env.ESI_CLIENT_SECRET;

module.exports = {

  authorize: (req, res) => {
    return SSO.login({
      client_id,
      client_secret,
      redirect_uri: 'http://gloss/api/auth/token',
      scope: 'esi-location.read_location.v1'
    }, res);
  },

  token: (req, res) => {
    SSO.getTokens({
      client_id,
      client_secret,
    }, req, res, (accessToken, charToken) => {
      req.session.accessToken = accessToken;
      req.session.charToken = charToken;

      res.redirect('http://gloss/navigate');
    });
  },

  whoAmI: (req, res) => {
    if (!req.session || !req.session.charToken)
      return res.status(401).send();

    return res.status(200).json(req.session.charToken);
  }

};
