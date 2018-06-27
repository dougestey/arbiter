/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

let port = 8090;
let worker = parseInt(process.env.NODE_APP_INSTANCE);

if (worker !== 0) {
  port = port + worker;
}

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  models: {
    datastore: 'arbiter',
    migrate: 'safe'
  },

  /***************************************************************************
   * Set the port in the production environment to 8080                      *
   ***************************************************************************/

  port,

  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  log: {
    level: 'error'
  },

  sockets: {

    /***************************************************************************
    *                                                                          *
    * Uncomment the `onlyAllowOrigins` whitelist below to configure which      *
    * "origins" are allowed to open socket connections to your Sails app.      *
    *                                                                          *
    * > Replace "https://example.com" etc. with the URL(s) of your app.        *
    * > Be sure to use the right protocol!  ("http://" vs. "https://")         *
    *                                                                          *
    ***************************************************************************/
    onlyAllowOrigins: [
      process.env.CLIENT_URL
    ]
  },

  security: {
    cors: {
      allRoutes: true,
      allowOrigins: [process.env.CLIENT_URL],
      allowCredentials: true,
    },
  },

  custom: {
    baseUrl: process.env.BASE_URL
  }

};
