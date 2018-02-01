module.exports = {

  async character(characterId, accessToken, refreshToken) {
    if (!characterId)
      return;

    let character = await Character.findOne({ characterId });

    // We have no local record and no access token to request a new one with, so quit.
    if (!character && !accessToken)
      return;

    // No access token was provided, so we retrieve the local one.
    if (!accessToken)
      accessToken = character.accessToken;

    // No refresh token was provided, so we retrieve the local one.
    if (!refreshToken)
      refreshToken = character.refreshToken;

    // Now call ESI for new data.
    let { name, corporation_id: corporationId, alliance_id: allianceId } = await Swagger.characterPublic(characterId),
        { solar_system_id: systemId } = await Swagger.characterLocation(characterId, accessToken, refreshToken),
        { online, last_login: lastLogin, last_logout: lastLogout } = await Swagger.characterOnline(characterId, accessToken, refreshToken),
        { ship_type_id: shipTypeId } = await Swagger.characterShip(characterId, accessToken, refreshToken),
        system, type, corporation, alliance;

    // Map local relationships.
    if (systemId) {
      system = await Swagger.system(systemId);
    }

    if (shipTypeId) {
      type = await Swagger.type(shipTypeId);
    }

    if (corporationId) {
      corporation = await Swagger.corporation(corporationId);
    }

    if (allianceId) {
      alliance = await Swagger.alliance(allianceId);
    }

    // Create or update the local record.
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
      corporation: corporation.id,
      alliance: alliance.id
    };

    if (!character) {
      character = await Character.create(payload);
    } else {
      character = await Character.update({ characterId }, payload);
    }

    return character;
  }
 
};