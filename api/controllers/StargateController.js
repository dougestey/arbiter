/**
 * StargateController
 *
 * @description :: Server-side logic for managing Stargates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  
  async findOne(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let stargate = await Swagger.stargate(req.params.id);

    if (!stargate)
      return res.notFound();

    return res.status(200).json(stargate);
  }

};

