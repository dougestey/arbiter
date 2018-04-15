const everyFiveSeconds = 5000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyFiveSeconds);
    setInterval(Scheduler.updateKills, everyOneHour); // TODO: Read headers to optimize call time
    setInterval(Scheduler.updateJumps, everyOneHour); // TODO: Read headers to optimize call time
    Scheduler.updateKills();
    Scheduler.updateJumps();
  }

};

module.exports = SwaggerUpdates;
