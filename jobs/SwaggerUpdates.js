const everyFiveSeconds = 5000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyFiveSeconds);
    setInterval(Scheduler.updateKills, everyOneHour);
    setInterval(Scheduler.updateJumps, everyOneHour);
  }

};

module.exports = SwaggerUpdates;