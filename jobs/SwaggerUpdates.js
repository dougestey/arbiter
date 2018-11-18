const everyTenSeconds = 10000;
const everyOneHour = 3600000;

let SwaggerUpdates = {

  kickoff() {
    // Connected character location intervals
    setInterval(ActiveSockets.scheduleUpdatesForActiveSockets, everyTenSeconds);
  }

};

module.exports = SwaggerUpdates;
