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
        if (!data || !data.system || !data.system.id)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet'.`);

        let { id } = await System.findOne(data.system.id);

        if (!id) {
          sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.id}.`);
          return;
        }

        let room = System.getRoomName(id);

        if (!room) {
          sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.id}.`);
          return;
        }

        // Notify system watchers of this fleet
        sails.sockets.broadcast(room, 'fleet', data);

        // Notify fleet subscribers
        sails.sockets.broadcast(data.id, 'fleet', data);

        // Notify active fleet list viewers
        sails.sockets.blast('active_fleet_update', data);
      });

      io.socket.on('fleet_expire', async(data) => {
        if (!data || !data.system || !data.system.id)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'fleet_expire'.`);

        let { id } = await System.findOne(data.system.id);

        if (!id) {
          sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.id}.`);
          return;
        }

        let room = System.getRoomName(id);

        if (!room) {
          sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.id}.`);
          return;
        }

        // Notify system watchers of this fleet
        sails.sockets.broadcast(room, 'fleet_expire', data);

        // Notify active fleet list viewers
        sails.sockets.blast('active_fleet_update', data);
      });

      io.socket.on('kill', async(data) => {
        if (!data || !data.system || !data.system.id)
          return sails.log.error(`[Sentinel] Not enough data to relay broadcast for 'kill'.`);

        let { id } = await System.findOne(data.system.id);

        if (!id) {
          sails.log.debug(`[Sentinel] Arbiter doesn't have a record for ${data.system.id}.`);
          return;
        }

        let room = System.getRoomName(id);

        if (!room) {
          sails.log.debug(`[Sentinel] Arbiter couldn't get a room id for ${data.system.id}.`);
          return;
        }

        sails.sockets.broadcast(room, 'kill', data);
      });
    },

    fleet(id, req) {
      let room = sails.sockets.getId(req);

      io.socket.get(`/api/sentinel/fleets/${id}/track`, (data) => {
        sails.sockets.broadcast(room, 'fleet_update', data);
      });
    },

    allActiveFleets(req) {
      let room = sails.sockets.getId(req);

      io.socket.get(`/api/sentinel/fleets/active`, (data) => {
        sails.sockets.broadcast(room, 'fleet_report', data);
      });
    },

    system(system, req) {
      let room = System.getRoomName(system.id);

      System.subscribe(req, [system.id]);

      io.socket.get(`/api/sentinel/systems/${system.id}/track`, (data) => {
        sails.sockets.broadcast(room, 'intel_system', data);
      });
    },

    constellation(systems, req) {
      for (let system of systems) {
        let room = System.getRoomName(system.id);

        System.subscribe(req, [system.id]);

        io.socket.get(`/api/sentinel/systems/${system.id}/track`, (data) => {
          sails.sockets.broadcast(room, 'intel_constellation', data);
        });
      }
    },

    region(systems, req) {
      for (let system of systems) {
        let room = System.getRoomName(system.id);

        System.subscribe(req, [system.id]);

        io.socket.get(`/api/sentinel/systems/${system.id}/track`, (data) => {
          sails.sockets.broadcast(room, 'intel_region', data);
        });
      }
    }

  };

}

module.exports = Sentinel;
