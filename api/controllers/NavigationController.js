/**
 * NavigationController
 *
 * @description :: Server-side logic for managing Navigation
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async route(req, res) {
    let { origin, destination } = req.params;
    let route = await Swagger.route(origin, destination);
    let resolved = [];

    for (let systemId of route) {
      let system = await System.findOne(systemId);

      resolved.push(system);
    };

    return res.status(200).json(resolved);
  }

};
