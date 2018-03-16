/**
 * ActiveSockets
 *
 * @description :: Keeps track of active client sockets.
 * @help        :: See https://next.sailsjs.com/documentation/concepts/services
 */

// Key value pairs, socket: characterId
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
      members.map((socketId) => {
        let characterId = pool[socketId];

        console.log(`Scheduling update for ${characterId}...`);

        Scheduler.updateCharacter(characterId);
      });
    });
  }

};

module.exports = ActiveSockets;
