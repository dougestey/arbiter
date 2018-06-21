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
    let systems = await System.find({ constellation: constellation.id });

    if (!constellation)
      return res.notFound();

    if (req.isSocket) {
      ActiveSockets.joinPool(req);

      for (let system of systems) {
        System.subscribe(req, [system.id]);
      }

      Sentinel.constellation(systems);
    }

    constellation.systems = systems;

    return res.status(200).json(constellation);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id } = await Constellation.findOne(req.params.id);
    let systems = await System.find({ constellation: id });

    for (let system in systems) {
      System.unsubscribe(req, [id]);
    }

    return res.status(200).json({ message: `Unsubscribed from constellation ${id}.`});
  }

};
