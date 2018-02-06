/**
 * ZkillPush
 *
 * @description :: Service handler for zKill push.
 * @help        :: https://github.com/zKillboard/RedisQ
 */

const ZKILL_PUSH_URL = 'https://redisq.zkillboard.com/listen.php?ttw=3';

let request = require('request');

module.exports = {

  fetch() {
    return new Promise((resolve, reject) => {
      request(ZKILL_PUSH_URL, async(error, response, body) => {
        if (error) {
          console.log(error);
          reject(error);
        }

        let { 
          killID: killId, 
          killmail: killMail,
          zkb: meta
        } = JSON.parse(body).package;

        let createdKill = await Kill.create({ killId, killMail, meta });

        ActiveSockets.notifyOfKill(createdKill);

        resolve();
      });
    });
  }

};
