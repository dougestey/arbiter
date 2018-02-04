/**
 * Jobs
 * (sails.config.jobs)
 *
 * Configured server cron jobs. Powered by Kue.
 *
 */

var kue = require('kue');

var jobs = kue.createQueue({
      prefix: 'kue',
      redis: {
        host: '127.0.0.1',
        port: 6379,
        auth: ''
      },
      disableSearch: true
    });

// ui for jobs
kue.app.listen(6565);

// give kue workers time to finish active job
process.once('SIGTERM', function() {
  jobs.shutdown(function(error) {
    sails.log.debug('Kue saw SIGTERM: ', error || 'ok');
    process.exit(0);
  }, 5000);
});

function init() {
  // Job Queues
  jobs.process('update_character', (job, done) => {
    Updater.character(job.data.characterId)
      .then((result) => {
        if (result instanceof Error) {
          done(result);
        } else {
          done(null, result);
        }
      });
  });

  jobs.process('update_kills', (job, done) => {
    Swagger.updateKills()
      .then((result) => {
        if (result instanceof Error) {
          done(result);
        } else {
          done(null, result);
        }
      });
  });

  jobs.process('update_jumps', (job, done) => {
    Swagger.updateJumps()
      .then((result) => {
        if (result instanceof Error) {
          done(result);
        } else {
          done(null, result);
        }
      });
  });

  // TODO:  if we ever cluster the server, these jobs should be in a
  //        worker process

  // Interval Jobs
  require('../jobs/SwaggerUpdates').kickoff();

  // remove jobs once completed
  jobs.on('job complete', function(id) {
    kue.Job.get(id, function(err, job) {
      if (err) {
        console.log(`Job ${id} failed: ${error}`);
      }

      if (err) { return; }
      job.remove();
    });
  });
}

var Jobs = {
  init: init,
  create: jobs.create
};

module.exports.jobs = Jobs;