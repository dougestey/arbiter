/**
 * Sentinel
 *
 * @description :: Interface to Sentinel.
 * @help        :: See https://github.com/dougestey/sentinel
 */

let socketIOClient = require('socket.io-client'),
    sailsIOClient = require('sails.io.js'),
    io = sailsIOClient(socketIOClient);

io.sails.url = process.env.SENTINEL_URL;
io.sails.reconnection = true;

let Sentinel = {

  io,

  initialize() {
    io.socket.on('connect', () => {
      io.socket.get(`/api/sentinel/socket`, () => {
        sails.log.debug(`[Sentinel] Connected to notification pool.`);
      });
    });

    // TODO: DRY this up
    io.socket.on('fleet', async(data) => {
      if (!data || !data.system || !data.system.systemId)
        return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet'.`);

      let { id } = await System.findOne({ systemId: data.system.systemId });

      if (!id) {
        sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.systemId}.`);
        return;
      }

      let room = System.getRoomName(id);

      if (!room) {
        sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.systemId}.`);
        return;
      }

      // Notify system watchers of this fleet
      sails.sockets.broadcast(room, 'fleet', data);

      // Notify fleet subscribers
      sails.sockets.broadcast(data.id, 'fleet', data);
    });

    io.socket.on('fleet_expire', async(data) => {
      if (!data || !data.system || !data.system.systemId)
        return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet_expire'.`);

      let { id } = await System.findOne({ systemId: data.system.systemId });

      if (!id) {
        sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.systemId}.`);
        return;
      }

      let room = System.getRoomName(id);

      if (!room) {
        sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.systemId}.`);
        return;
      }

      sails.sockets.broadcast(room, 'fleet_expire', data);
    });

    io.socket.on('kill', async(data) => {
      if (!data || !data.system || !data.system.systemId)
        return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'kill'.`);

      let { id } = await System.findOne({ systemId: data.system.systemId });

      if (!id) {
        sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.systemId}.`);
        return;
      }

      let room = System.getRoomName(id);

      if (!room) {
        sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.systemId}.`);
        return;
      }

      sails.sockets.broadcast(room, 'kill', data);
    });
  },

  system(id, systemId) {
    let room = System.getRoomName(id);

    io.socket.get(`/api/sentinel/systems/${systemId}/track`, (data) => {
      sails.sockets.broadcast(room, 'intel', data);
    });
  }

};

module.exports = Sentinel;
