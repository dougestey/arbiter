let redis = require('redis'),
    redisUrl = `redis://localhost:${parseInt(process.env.REDIS_PORT)}/1`;

let db = redis.createClient(redisUrl);

if (process.env.FLUSH_REDIS_ON_BOOT === 'true' && parseInt(process.env.NODE_APP_INSTANCE) === 0)
  db.flushdb();

module.exports.redis = db;
