const everyFiveSeconds = 5000;

let ZkillUpdates = {

  kickoff() {
    setInterval(Scheduler.readKillStream, everyFiveSeconds);
  }

};

module.exports = ZkillUpdates;
