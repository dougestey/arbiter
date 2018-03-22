/**
 * Sentinel
 *
 * @description :: Keeps track of active client sockets.
 * @help        :: See https://next.sailsjs.com/documentation/concepts/services
 */

let socketIOClient = require('socket.io-client'),
    sailsIOClient = require('sails.io.js'),
    io = sailsIOClient(socketIOClient);

io.sails.url = process.env.SENTINEL_URL;
io.sails.reconnection = true;

let Sentinel = {

  io,

  initialize: () => {
    io.socket.on('fleet', async(data) => {
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

      sails.sockets.broadcast(room, 'fleet', data);
    });

    io.socket.on('kill', async(data) => {
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

  system: (id, systemId) => {
    let room = System.getRoomName(id);

    io.socket.get(`/api/sentinel/tracker/systems/${systemId}`, (data) => {
      sails.sockets.broadcast(room, 'intel', data);
    });
  }

};

module.exports = Sentinel;
