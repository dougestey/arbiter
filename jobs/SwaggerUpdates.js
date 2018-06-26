const everyFiveSeconds = 10000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyFiveSeconds);
    setInterval(Scheduler.updateStats, everyOneHour); // TODO: Read headers to optimize call time
    Scheduler.updateStats();
  }

};

module.exports = SwaggerUpdates;
