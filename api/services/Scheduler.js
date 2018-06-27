/**
 * Scheduler
 *
 * @description :: Schedules jobs in Kue.
 * @help        :: https://github.com/Automattic/kue
 */

module.exports = {

  // ESI
  updateCharacter(characterId) {
    let job = sails.config.jobs.create('update_character', { characterId }).ttl(10000).removeOnComplete(true);

    job.on('failed', function(err) {
      console.error('[Scheduler.updateCharacter] Job failed');
      console.error(err);
    });

    job.save();
  },

  updateStats() {
    let job = sails.config.jobs.create('update_stats').removeOnComplete(true);

    job.on('failed', function(err) {
      console.error('[Scheduler.updateStats] Job failed');
      console.error(err);
    });

    job.save();
  }

};
