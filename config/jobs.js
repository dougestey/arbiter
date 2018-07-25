/**
 * Jobs
 * (sails.config.jobs)
 *
 * Configure server cron jobs. Powered by Kue.
 *
 */

let kue = require('kue');
let jobs = kue.createQueue({
  prefix: 'kue',
  redis: {
    host: '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT),
    auth: ''
  },
  disableSearch: true
});

// give kue workers time to finish active job
process.once('SIGTERM', function() {
  jobs.shutdown(function(error) {
    sails.log.debug('Kue saw SIGTERM: ', error || 'ok');
    process.exit(0);
  }, 5000);
});

function init() {
  // UI for jobs
  //
  // Only master should serve this up. We don't need umpteen UIs.
  if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
    kue.app.listen(parseInt(process.env.KUE_PORT));
  }

  // Job Queues
  //
  // Run characters updates on slaves only. This frees up master to
  // authorize/create new characters and handle socket connections.
  //
  // By default queues have a concurrency of 1. This can be overridden
  // with an optional second param.
  //
  // See Kue documentation: https://github.com/Automattic/kue#processing-concurrency
  if (parseInt(process.env.NODE_APP_INSTANCE) !== 0) {
    kue.Job.rangeByState( 'failed', 0, 1000, 'asc', function( err, jobs ) {
      jobs.forEach(function (job) {
        job.remove(function () {
          sails.log.debug(`Clearing job #${job.id}`);
        });
      });
    });

    jobs.process('update_character', 5, (job, done) => {
      sails.log.debug(`Worker ${process.env.NODE_APP_INSTANCE} performing update_character task.`);

      Updater.character(job.data.characterId)
        .then((result) => {
          if (result instanceof Error) {
            done(result);
          } else {
            done(null, result);
          }
        });
    });
  }

  jobs.process('update_stats', (job, done) => {
    sails.log.debug(`Worker ${process.env.NODE_APP_INSTANCE} performing update_stats task.`);

    Swagger.updateStats()
      .then((result) => {
        if (result instanceof Error) {
          done(result);
        } else {
          done(null, result);
        }
      });
  });

  // Interval Jobs
  // Only master should be scheduling jobs; anything else is chaos.
  if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
    require('../jobs/SwaggerUpdates').kickoff();
  }
}

var Jobs = {
  init: init,
  create: jobs.create
};

module.exports.jobs = Jobs;
