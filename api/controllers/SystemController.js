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

    let system;

    if (isNaN(req.params.id))
      system = await System.findOne({ name: req.params.id })
    else
      system = await Swagger.system(req.params.id);

    if (!system)
      return res.notFound();

    // TODO: unsubscribe from previous system
    if (req.isSocket) {
      ActiveSockets.joinPool(req);
      System.subscribe(req, [system.id]);
      Sentinel.system(system.id, system.systemId);
    }

    return res.status(200).json(system);
  }

};
