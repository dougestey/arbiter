const everyTenSeconds = 10000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    // Connected character location intervals
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyTenSeconds);

    // System, constellation and region stats
    if (process.env.NODE_ENV === 'production') {
      setInterval(Scheduler.updateStats, everyOneHour); // TODO: Read headers to optimize call time
      setTimeout(Scheduler.updateStats, 300000); // First kick
    }
  }

};

module.exports = SwaggerUpdates;
