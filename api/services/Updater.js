// TODO: This service has an identity crisis, is ambiguously named.
let _dbError = (e) => {
  sails.log.error('[Updater] Aborting character update due to EVE SDE failure.');
  sails.log.error(e);
  return;
}

module.exports = {

  async character(characterId, accessTokens) {
    if (!characterId)
      return;

    let character = await Character.findOne(characterId)
      .populate('ship')
      .populate('system');

    let accessToken, refreshToken;

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
    } = await Swagger.characterPublic(characterId);

    let characterStatusChanged, shipDidChange, onlineDidChange;
    let lastShipId, lastSystemId, lastLocationUpdate, systemDidChange;

    let characterPrivateCall = await Swagger.characterPrivate(characterId, accessToken, refreshToken);

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
    } = characterPrivateCall;

    // Map local relationships.
    let system = await System.findOne(systemId).catch(_dbError);
    let type = await Type.findOne(shipTypeId).catch(_dbError);

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
      id: characterId,
      name,
      online: isOnline,
      lastLogin,
      lastLogout,
      lastLocationUpdate,
      accessToken,
      refreshToken,
      ship: type.id,
      system: system.id,
    };

    // Only let master create corps & alliances to avoid collisions.
    if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
      if (corporationId) {
        let corporation = await Swagger.corporation(corporationId);

        if (corporation.id)
          payload.corporation = corporation.id;
      }

      if (allianceId) {
        let alliance = await Swagger.alliance(allianceId);

        if (alliance.id)
          payload.alliance = alliance.id;
      }
    }

    if (!character) {
      character = await Character.create(payload);
    } else {
      character = await Character.update(characterId, payload);
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
