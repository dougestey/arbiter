# Arbiter

A high-performance, WebSocket-compatible server interface to the EVE Swagger API, built [on Sails.js](https://sailsjs.com/).

The authority for [GLOSS](https://github.com/dougestey/gloss).

## Features ##
- EVE SSO Authentication
  - Automatic refresh token handling
- EVE Swagger API (ESI) support
- REST support for all models
- WebSocket pub/sub support for all models
- Database agnosticism thanks to [Waterline ORM](http://waterlinejs.org/)
- Sophisticated Redis-based job scheduler backed by [Kue](https://github.com/Automattic/kue)
  - Updates location, ship, status for active character sockets every 5 seconds

## How to run ###
Arbiter requires Node 8, a running database server, and a Redis instance. MongoDB is configured by default, but any [Waterline-supported database](https://next.sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) will do. A sample nginx config is [provided](https://github.com/dougestey/arbiter/blob/master/nginx_config).

You need a recent copy of the EVE SDE. Conversions are provided by the wonderful [Fuzzwork](http://fuzzwork.co.uk/dump). Depending on the database you choose for this (it is not the same as Arbiter's internal DB) you'll want to download PostgreSQL dump, the MySQL dump, or what have you.

Example (assuming db `eve` running on PostgreSQL):
`pg_restore --no-privileges --no-owner -d eve postgres-20180529-TRANQUILITY.dmp`

- Register an EVE application at https://developers.eveonline.com
- Enter client ID & secret in the .env ([example provided here](https://github.com/dougestey/arbiter/blob/master/.env_example))
- `sudo npm i -g yarn ember-cli sails@1.0.0-45`
- `git clone git@github.com:dougestey/arbiter.git`
- `cd arbiter`
- `yarn`
- `sails lift` (with Sails CLI installed) or `npm start`

Server currently listens on :8080, this can be configured in [config/env](https://github.com/dougestey/arbiter/tree/master/config/env).

Kue web frontend is available at :6565.

### Example routes ###
- `GET /api/systems`
- `GET /api/systems/:systemId`
