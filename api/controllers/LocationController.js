/**
 * LocationController
 *
 * @description :: Server-side logic for managing Locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async current(req, res) {
    let location = await Swagger.characterLocation(req);
    let system = await Swagger.system(location.solar_system_id);

    return res.status(200).json(system);
  }

};

