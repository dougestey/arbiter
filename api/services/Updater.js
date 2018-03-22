// TODO: This service has an identity crisis, is ambiguously named.

module.exports = {

  async character(characterId, accessTokens) {
    if (!characterId)
      return;

    let character = await Character.findOne({ characterId }).populate('ship').populate('system'),
        accessToken, refreshToken;

    if (!accessTokens && !character)
      return;

    if (!accessTokens) {
      accessToken = character.accessToken,
      refreshToken = character.refreshToken;
    } else {
      accessToken = accessTokens.access_token;
      refreshToken = accessTokens.refresh_token;
    }

    // Now call ESI for new data.
    let { 
      name,
      corporation_id: corporationId,
      alliance_id: allianceId
    } = await Swagger.characterPublic(characterId),
    system, type, corporation, alliance, characterStatusChanged, lastShipId, lastSystemId, lastLocationUpdate, systemDidChange, shipDidChange, onlineDidChange;

    let {
      location: {
        solar_system_id: systemId
      },
      ship: {
        ship_type_id: shipTypeId
      },
      online: {
        online: isOnline,
        last_login: lastLogin,
        last_logout: lastLogout
      }
    } = await Swagger.characterPrivate(characterId, accessToken, refreshToken);

    // Map local relationships.
    if (systemId)
      system = await Swagger.system(systemId);

    if (shipTypeId)
      type = await Swagger.type(shipTypeId);

    if (corporationId)
      corporation = await Swagger.corporation(corporationId);

    if (allianceId)
      alliance = await Swagger.alliance(allianceId);

    if (character) {
      if (character.ship && character.ship.id) {
        lastShipId = character.ship.id;
      }

      if (character.system && character.system.id) {
        lastSystemId = character.system.id;
      }

      if (character.lastLocationUpdate) {
        lastLocationUpdate = character.lastLocationUpdate;
      }

      systemDidChange = system && system.id !== lastSystemId;
      shipDidChange = type && type.id !== lastShipId;
      onlineDidChange = isOnline !== character.online;
    }

    if (systemDidChange)
      lastLocationUpdate = new Date().toISOString();

    if (shipDidChange || systemDidChange || onlineDidChange) {
      characterStatusChanged = true;
    }

    // Create or update the local record.
    let payload = {
          characterId,
          name,
          online: isOnline,
          lastLogin,
          lastLogout,
          lastLocationUpdate,
          accessToken,
          refreshToken,
          ship: type.id,
          system: system.id,
          corporation: corporation.id,
          alliance: alliance ? alliance.id : undefined
        };

    if (!character) {
      character = await Character.create(payload);
    } else {
      character = await Character.update({ characterId }, payload);
      character = character[0];
    }

    if (characterStatusChanged) {
      character = await Character.findOne(character.id)
        .populate('system')
        .populate('ship')
        .populate('corporation')
        .populate('alliance');

      Character.publish([character.id], character);
    }

    return character;
  }
 
};
