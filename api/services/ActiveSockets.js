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

  scheduleUpdatesForActiveSockets() {
    sails.io.sockets.in('activeSockets').clients((err, sockets) => {
      sockets.map((id) => {
        let characterId = pool[id];
        Scheduler.updateCharacter(characterId);
      });
    });
  }

};

module.exports = ActiveSockets;
