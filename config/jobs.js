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
        port: process.env.REDIS_PORT,
        auth: ''
      },
      disableSearch: true
    });

// ui for jobs
kue.app.listen(process.env.KUE_PORT);

// give kue workers time to finish active job
process.once('SIGTERM', function() {
  jobs.shutdown(function(error) {
    sails.log.debug('Kue saw SIGTERM: ', error || 'ok');
    process.exit(0);
  }, 5000);
});

function init() {
  // Job Queues
  jobs.process('update_character', 5, (job, done) => {
    Updater.character(job.data.characterId)
      .then((result) => {
        if (result instanceof Error) {
          done(result);
        } else {
          done(null, result);
        }
      });
  });

  jobs.process('update_stats', (job, done) => {
    Swagger.updateStats()
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
  // require('../jobs/ZkillUpdates').kickoff();

  // remove jobs once completed
  jobs.on('job complete', function(id) {
    kue.Job.get(id, function(err, job) {
      if (err) {
        sails.log.error(`Job ${id} failed: ${err}`);
      }

      job.remove();
    });
  });
}

var Jobs = {
  init: init,
  create: jobs.create
};

module.exports.jobs = Jobs;
