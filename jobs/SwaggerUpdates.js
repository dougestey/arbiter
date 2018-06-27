const everyTenSeconds = 10000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyTenSeconds);
    setInterval(Scheduler.updateStats, everyOneHour); // TODO: Read headers to optimize call time

    // Settle down before doing heavy processing
    setTimeout(Scheduler.updateStats, 300000);
  }

};

module.exports = SwaggerUpdates;
