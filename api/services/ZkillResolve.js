/**
 * ZkillPush
 *
 * @description :: Service to resolve data from Zkill.
 * @help        :: https://github.com/zKillboard/RedisQ
 */

let _buildCharacter = async(record) => {
  let { name } = await Swagger.characterPublic(record.characterId),
      ship = await Swagger.type(record.shipTypeId),
      corporation = await Swagger.corporation(record.corporationId),
      alliance;

  if (record.allianceId)
    alliance = await Swagger.alliance(record.allianceId);

  return {
    name,
    ship,
    corporation,
    alliance
  };
};

module.exports = {

  async kill(record) {
    let { killId, time, totalAttackers } = record;

    let victim = await _buildCharacter({
      characterId: record.victimCharacterId,
      shipTypeId: record.victimShipTypeId,
      corporationId: record.victimCorporationId,
      allianceId: record.victimAllianceId
    });

    let attacker = await _buildCharacter({
      characterId: record.attackerCharacterId,
      shipTypeId: record.attackerShipTypeId,
      corporationId: record.attackerCorporationId,
      allianceId: record.attackerAllianceId
    });

    return {
      killId,
      time,
      victim,
      attacker,
      totalAttackers
    };
  }

};
