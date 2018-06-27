var redis = require('redis');
var url = require('url');
var redisUrl = url.parse('redis://user:@localhost:6379/');

var db = redis.createClient();

if (process.env.FLUSH_REDIS === 'true' && parseInt(process.env.NODE_APP_INSTANCE) === 0)
  db.flushdb();

module.exports.redis = db;
