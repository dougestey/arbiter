/**
 * Sentinel
 *
 * @description :: Keeps track of active client sockets.
 * @help        :: See https://next.sailsjs.com/documentation/concepts/services
 */

let socketIOClient = require('socket.io-client'),
    sailsIOClient = require('sails.io.js'),
    io = sailsIOClient(socketIOClient);

io.sails.url = 'http://localhost:8081';
io.sails.reconnection = true;

let Sentinel = {

  io,

  initialize: () => {
    io.socket.on('fleet', (data) => {
      let { id } = System.findOne({ systemId: data.system.systemId }),
          room = System.getRoomName(id);

      sails.sockets.broadcast(room, 'fleet', data);
    });

    io.socket.on('kill', (data) => {
      let { id } = System.findOne({ systemId: data.system.systemId }),
          room = System.getRoomName(id);

      sails.sockets.broadcast(room, 'kill', data);
    });
  },

  system: (id, systemId) => {
    let room = System.getRoomName(id);

    io.socket.get(`/api/tracker/systems/${systemId}`, (data) => {
      sails.sockets.broadcast(room, 'intel', data);
    });
  }

};

module.exports = Sentinel;
