const everyFiveSeconds = 5000;

let CharacterLocation = {

  init: function() {
    setInterval(CharacterLocation.liveTracking, everyFiveSeconds);
  },

  async liveTracking() {
    // TODO: Swap this out once we have sockets up and running.
    let characters = await Character.find();

    characters.map(({ characterId }) => {
      Scheduler.updateCharacter(characterId);
    });
  }

};

module.exports = CharacterLocation;
