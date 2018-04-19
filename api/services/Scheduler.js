/**
 * Scheduler
 *
 * @description :: Schedules jobs in Kue.
 * @help        :: https://github.com/Automattic/kue
 */

module.exports = {

  // ESI

  updateCharacter(characterId) {
    let job = sails.config.jobs.create('update_character', { characterId }).ttl(15000);

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
  }

};
