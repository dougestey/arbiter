var redis = require('redis');
var url = require('url');
var redisUrl = url.parse('redis://user:@localhost:6379/');

var db = redis.createClient();

if (process.env.FLUSH_REDIS === 'true')
  db.flushdb();

module.exports.redis = db;
