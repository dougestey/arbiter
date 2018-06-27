/**
 * ConstellationController
 *
 * @description :: Server-side logic for managing Constellations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async findOne(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let constellation = await Constellation.findOne(req.params.id);

    if (!constellation)
      return res.notFound();

    constellation.systems = await System.find({ constellation: constellation.id });
    let stats = await Stat.find({ constellation: constellation.id }).sort('createdAt DESC').limit(1);
    constellation.stats = stats[0];

    if (req.isSocket) {
      // Never hurts to make sure the client is in the pool
      ActiveSockets.joinPool(req);

      // Let Sentinel know we need a fleet payload for this constellation
      Sentinel.constellation(constellation.systems, req);
    }

    // Return constellation record with populated systems
    return res.status(200).json(constellation);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id } = await Constellation.findOne(req.params.id);
    let systems = await System.find({ constellation: id });

    for (let system of systems) {
      System.unsubscribe(req, [id]);
    }

    return res.status(200).json({ message: `Unsubscribed from constellation ${id}.`});
  }

};
