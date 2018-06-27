/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

require('dotenv-safe').config();

module.exports.bootstrap = async(cb) => {

  if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {
    Sentinel.initialize();
  }

  sails.config.jobs.init();

  cb();

};
