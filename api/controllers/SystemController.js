/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async findOne(req, res) {
    if (!req.params.systemId)
      return res.badRequest();

    let system = await Swagger.system(req.params.systemId);

    if (!system)
      return res.notFound();

    return res.status(200).json(system);
  }

};
