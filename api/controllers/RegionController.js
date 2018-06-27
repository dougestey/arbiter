/**
 * RegionController
 *
 * @description :: Server-side logic for managing Regions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async findOne(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let region = await Region.findOne(req.params.id);

    if (!region)
      return res.notFound();

    region.systems = await System.find({ region: region.id });
    let stats = await Stat.find({ region: region.id }).sort('createdAt DESC').limit(1);
    region.stats = stats[0];

    if (req.isSocket) {
      // Never hurts to make sure the client is in the pool
      ActiveSockets.joinPool(req);

      // Let Sentinel know we need a fleet payload for this region
      Sentinel.region(region.systems, req);
    }

    // Return region record with populated systems
    return res.status(200).json(region);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id } = await Region.findOne(req.params.id);
    let systems = await System.find({ region: id });

    for (let system of systems) {
      System.unsubscribe(req, [id]);
    }

    return res.status(200).json({ message: `Unsubscribed from region ${id}.`});
  }

};
