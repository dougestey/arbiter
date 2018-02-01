module.exports = {

  updateCharacter(characterId) {
    let job = sails.config.jobs.create('update_character', { characterId })
      .attempts(3);

    job.on('failed', function(err) {
      console.error('[Scheduler.updateCharacter] Job failed');
      console.error(err);
    });

    job.save();
  }

};
