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

    let system = await Swagger.system(req.params.id);
    let constellation = await Swagger.constellation(system.constellationId);

    if (!system)
      return res.notFound();

    if (req.isSocket) {
      ActiveSockets.joinPool(req);
      System.subscribe(req, [system.id]);
      Sentinel.system(system.id, system.systemId);
    }

    return res.status(200).json(system);
  },

  async untrack(req, res) {
    if (!req.params.id || !req.isSocket)
      return res.badRequest();

    let { id, systemId } = await System.findOne({ systemId: req.params.id });

    System.unsubscribe(req, [id]);

    return res.status(200).json({ message: `Unsubscribed from system ${systemId}.`});
  }

};
