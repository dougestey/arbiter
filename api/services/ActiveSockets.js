let pool = {};

let ActiveSockets = {

  getPool() {
    return pool;
  },

  joinPool(req) {
    let characterId = req.session.characterToken.CharacterID,
        socketId = sails.sockets.getId(req);

    if (!_.has(pool, socketId)) {
      sails.sockets.join(req, 'activeSockets');
      pool[socketId] = characterId;
    }
  },

  // Schedule character updates for connected sockets
  scheduleUpdatesForActiveSockets() {
    sails.io.sockets.in('activeSockets').clients((err, members) => {
      members.map((id) => {
        let characterId = pool[id];
        Scheduler.updateCharacter(characterId);
      });
    });
  },

  // Notify connected sockets of kills in their subscribed system(s).
  // This is expensive, so we're careful to only resolve records that would
  // have a subscriber to send them to.
  async notifyOfKill(record) {
    let system = await System.findOne({ systemId: record.systemId });
    let room = System.getRoomName(system.id);

    sails.io.sockets.in(room).clients((err, members) => {
      members.map(async(id) => {
        let resolved = await ZkillResolve.kill(record);

        sails.sockets.broadcast(id, 'kill', resolved);
      });
    });
  }

};

module.exports = ActiveSockets;
