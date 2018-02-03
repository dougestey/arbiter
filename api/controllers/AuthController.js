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
      scope: 'esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-location.read_online.v1'
    }, res);
  },

  token: (req, res) => {
    SSO.getTokens({
      client_id,
      client_secret,
    }, req, res, async(accessTokens, characterToken) => {
      req.session.accessTokens = accessTokens;
      req.session.characterToken = characterToken;

      await Updater.character(characterToken.CharacterID, accessTokens);

      res.redirect('http://gloss/navigate');
    });
  },

  whoAmI: async(req, res) => {
    if (!req.session || !req.session.characterToken)
      return res.status(401).send();

    let character = await Character.find({ characterId: req.session.characterToken.CharacterID })
      .populate('system')
      .populate('ship');

    return res.status(200).json({ character: character[0] });
  }

};
