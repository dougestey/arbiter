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

let Sentinel = {

  io,

  system: (id, systemId) => {
    let room = System.getRoomName(id);

    io.socket.get(`/api/tracker/systems/${systemId}`, (data) => {
      sails.sockets.broadcast(room, 'intel', data);
    });

    io.socket.on('fleet', (data) => {
      sails.sockets.broadcast(room, 'fleet', data);
    });

    io.socket.on('kill', (data) => {
      sails.sockets.broadcast(room, 'kill', data);
    });
  }

};

module.exports = Sentinel;
