/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let _serializeStats = async({ id }) => {
  let stats = await Stat.find({ system: id }).sort('createdAt DESC').limit(2);

  let npcKills = 0,
      shipKills = 0,
      podKills = 0,
      shipJumps = 0,
      createdAt;

  if (stats.length) {
    for (let stat of stats) {
      if (stat.npcKills) {
        npcKills = stat.npcKills;
      }

      if (stat.shipKills) {
        shipKills = stat.shipKills;
      }

      if (stat.podKills) {
        podKills = stat.podKills;
      }

      if (stat.shipJumps) {
        shipJumps = stat.shipJumps;
      }

      if (stat.createdAt) {
        createdAt = stat.createdAt;
      }
    }
  } else {
    // If we have no stats, it means ESI never returned them - which means they're all 0.
    let stat = await Stat.find().sort('createdAt DESC').limit(1);

    createdAt = stat.createdAt;
  }

  return { npcKills, shipKills, podKills, shipJumps, createdAt };
};

module.exports = {

  async findOne(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let system = await System.findOne(req.params.id);
    system.stats = await _serializeStats(system);

    if (req.isSocket) {
      ActiveSockets.joinPool(req);

      Sentinel.system(system, req);
    }

    return res.status(200).json(system);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id } = await System.findOne(req.params.id);

    System.unsubscribe(req, [id]);

    return res.status(200).json({ message: `Unsubscribed from system ${id}.`});
  }

};
