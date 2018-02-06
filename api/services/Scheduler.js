module.exports = {

  updateCharacter(characterId) {
    let job = sails.config.jobs.create('update_character', { characterId });

    job.on('failed', function(err) {
      console.error('[Scheduler.updateCharacter] Job failed');
      console.error(err);
    });

    job.save();
  },

  updateKills() {
    let job = sails.config.jobs.create('update_kills');

    job.on('failed', function(err) {
      console.error('[Scheduler.updateKills] Job failed');
      console.error(err);
    });

    job.save();
  },

  updateJumps() {
    let job = sails.config.jobs.create('update_jumps');

    job.on('failed', function(err) {
      console.error('[Scheduler.updateJumps] Job failed');
      console.error(err);
    });

    job.save();
  },

  readKillStream() {
    let job = sails.config.jobs.create('read_kill_stream');

    job.on('failed', function(err) {
      console.error('[Scheduler.readKillStream] Job failed');
      console.error(err);
    });

    job.save();
  }

};
