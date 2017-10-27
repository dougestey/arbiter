/**
 * SystemController
 *
 * @description :: Server-side logic for managing Systems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  findOne(req, res) {
    return System.findOne({ systemId: req.params.systemId })
      .then((system) => {
        if (!system) {
          return res.notFound();
        }

        return res.status(200).json(system);
      }, (error) => {
        return res.serverError(err);
      })
  }

};
