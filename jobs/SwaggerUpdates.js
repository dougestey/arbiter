const everyFiveSeconds = 5000;

let SwaggerUpdates = {

  kickoff() {
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyFiveSeconds);
  }

};

module.exports = SwaggerUpdates;