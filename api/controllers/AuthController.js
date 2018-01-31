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

      let { CharacterID: characterId, CharacterName: name } = characterToken,
          { access_token: accessToken, refresh_token: refreshToken } = accessTokens,
          { solar_system_id: systemId, station_id: stationId } = await Swagger.characterLocation(characterId, accessToken),
          { online, last_login: lastLogin, last_logout: lastLogout } = await Swagger.characterOnline(characterId, accessToken),
          { ship_type_id: shipTypeId } = await Swagger.characterShip(characterId, accessToken);

      let system, station, type;

      if (systemId) {
        system = await Swagger.system(systemId);
      }

      // if (stationId) {
      //   station = await Station.findOrCreate({ stationId });
      // }

      if (shipTypeId) {
        type = await Swagger.type(shipTypeId);
      }

      let payload = {
        characterId,
        name,
        online,
        lastLogin,
        lastLogout,
        accessToken,
        refreshToken,
        ship: type.id,
        system: system.id,
        // station: station ? station.id : undefined
      };

      let character = await Character.findOne({ characterId });

      if (!character) {
        character = await Character.create(payload);
      } else {
        character = await Character.update({ characterId }, payload);
      }

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
