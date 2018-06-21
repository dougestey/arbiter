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
    let systems = await System.find({ region: region.id });

    if (!region)
      return res.notFound();

    if (req.isSocket) {
      ActiveSockets.joinPool(req);

      for (let system of systems) {
        System.subscribe(req, [system.id]);
      }

      Sentinel.region(systems);
    }

    region.systems = systems;

    return res.status(200).json(region);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id } = await Region.findOne(req.params.id);
    let systems = await System.find({ region: id });

    for (let system in systems) {
      System.unsubscribe(req, [id]);
    }

    return res.status(200).json({ message: `Unsubscribed from region ${id}.`});
  }

};
