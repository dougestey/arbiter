# Arbiter

A high-performance, WebSocket-compatible server interface to the EVE Swagger API, built [on Sails.js](https://sailsjs.com/).

The authority for [Gloss](https://github.com/dougestey/gloss).

Currently under heavy development. Not supported in any way by the author at this time.

## Features ##
- EVE SSO Authentication
  - Automatic refresh token handling
- EVE Swagger API (ESI) support
- zKillboard/RedisQ support
- REST support for all models
- WebSocket pub/sub support for all models
- Database agnosticism thanks to [Waterline ORM](http://waterlinejs.org/)
- Sophisticated Redis-based job scheduler backed by [Kue](https://github.com/Automattic/kue)
  - Updates location, ship, status for active character sockets every 5 seconds
  - Updates ship jumps, kills, pods, NPCs from ESI every 1 hour
  - Updates killmail reports from zKillboard as they become available

## Roadmap
See the [Gloss README](https://github.com/dougestey/gloss).

## How to run ###
Arbiter requires Node 8, a running database server, and a Redis instance. MongoDB is configured by default, but any [Waterline-supported database](https://next.sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) will do. A sample nginx config is [provided](https://github.com/dougestey/arbiter/blob/master/nginx_config).

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
- `GET /api/kills`
- `GET /api/characters`
- `GET /api/characters/:characterId`

## Third party APIs ###
Arbiter is intended to be a rich source of information for pilots on the move. This cannot be achieved with ESI alone. We're currently considering additional data sources:

| Name | Link | Features | Status |
| --- | --- | --- | --- |
| ~~RedisQ~~ | https://github.com/zKillboard/RedisQ | Live kill reports | Done |
| zKillboard (Killmails) | https://github.com/zKillboard/zKillboard/wiki/API-(Killmails) | Rich kill information | Consideration |
| zKillboard (Statistics) | https://github.com/zKillboard/zKillboard/wiki/API-(Statistics) | Combat trends, groups | Consideration |
| Structure Name API | https://stop.hammerti.me.uk/api/docs/structure | Filling in CCP's Citadel gaps | Consideration |
| Fleet-Up | http://fleet-up.com/Api/Endpoints | Alliance/Corp ops, doctrines | Consideration |
