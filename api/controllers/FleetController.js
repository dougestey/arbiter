/**
 * FleetController
 *
 * @description :: Server-side logic for managing Fleets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  async track(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let { id: fleetId } = req.params;

    if (req.isSocket) {
      sails.sockets.join(req, fleetId);
    } else {
      return res.badRequest();
    }

    return res.status(200).json({ message: `Subscribed to fleet ${fleetId}.`});
  },

  async untrack(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let { id: fleetId } = req.params;

    if (req.isSocket) {
      sails.sockets.leave(req, fleetId);
    } else {
      return res.badRequest();
    }

    return res.status(200).json({ message: `Unsubscribed from fleet ${fleetId}.`});
  }

};
