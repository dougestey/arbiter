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
      sails.sockets.join(fleetId, req, () => {
        Sentinel.fleet(fleetId, req);
      });

      return res.status(200).json({ message: `Subscribed to fleet ${fleetId}.`});
    } else {
      return res.badRequest();
    }
  },

  async untrack(req, res) {
    if (!req.params.id)
      return res.badRequest();

    let { id: fleetId } = req.params;

    if (req.isSocket) {
      sails.sockets.leave(req, `Fleet${fleetId}`);

      return res.status(200).json({ message: `Unsubscribed from fleet ${fleetId}.`});
    } else {
      return res.badRequest();
    }
  },

  async active(req, res) {
    if (req.isSocket) {
      Sentinel.activeFleets(req);

      return res.status(200).json({ message: `Getting list of active fleets.`});
    } else {
      return res.badRequest();
    }
  },

};
