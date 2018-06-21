/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async findOne(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let system = await System.findOne(req.params.id)
      .populate('constellation')
      .populate('region');

    if (!system)
      return res.notFound();

    if (req.isSocket) {
      ActiveSockets.joinPool(req);
      System.subscribe(req, [system.id]);
      Sentinel.system(system.id);
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
