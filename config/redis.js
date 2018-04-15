var redis = require('redis');
var url = require('url');
var redisUrl = url.parse('redis://user:@localhost:6379/');

var db = redis.createClient();

db.flushdb();

module.exports.redis = db;
