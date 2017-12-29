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

require('dotenv').config();

module.exports.bootstrap = async function(cb) {

  // cb() must be called in order for sails to lift
  await Swagger.initialize();
  await Swagger.updateJumps();
  await Swagger.updateKills();

  cb();
};
