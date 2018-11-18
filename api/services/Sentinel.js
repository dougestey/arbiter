/**
 * Sentinel
 *
 * @description :: Interface to Sentinel.
 * @help        :: See https://github.com/dougestey/sentinel
 */

let Sentinel = {};

if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
  let socketIOClient = require('socket.io-client'),
    sailsIOClient = require('sails.io.js'),
    io = sailsIOClient(socketIOClient);

  io.sails.url = process.env.SENTINEL_URL;
  io.sails.reconnection = true;
  io.sails.transports = ['websocket'];

  Sentinel = {

    io,

    initialize() {
      io.socket.on('connect', () => {
        io.socket.get(`/api/sentinel/socket`, () => {
          sails.log.debug(`[Sentinel] Connected to notification pool.`);
        });
      });

      io.socket.on('fleet', async(data) => {
        if (!data)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet'.`);

        // Notify active fleet list viewers
        sails.sockets.blast('fleet', data);
      });

      io.socket.on('fleet_expire', async(data) => {
        if (!data)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet_expire'.`);

        // Notify active fleet list viewers
        sails.sockets.blast('fleet', data);
      });

      io.socket.on('kill', async(data) => {
        if (!data)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'kill'.`);

        // Notify active kill list viewers
        sails.sockets.blast('kill', data);
      });
    },

    // Receives active fleets request and mirrors it to Sentinel
    activeFleets(req) {
      let room = sails.sockets.getId(req);

      io.socket.get(`/api/sentinel/fleets/active`, (data) => {
        sails.sockets.broadcast(room, 'active_fleets', data);
      });
    },

    fleet(id, req) {
      let room = sails.sockets.getId(req);

      io.socket.get(`/api/sentinel/fleets/${id}`, (data) => {
        sails.sockets.broadcast(room, 'fleet_update', data);
      });
    },

  };

}

module.exports = Sentinel;
