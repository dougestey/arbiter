# Arbiter

A high-performance, WebSocket-compatible server interface to the EVE Swagger API, built [on Sails.js](https://sailsjs.com/).

The authority for [Gloss](https://github.com/dougestey/gloss).

Currently under heavy development. Not supported in any way by the author at this time.

## Features ##
- EVE SSO Authentication
  - Automatic refresh token handling
- EVE Swagger API (ESI) support
- REST support for all models
- WebSocket support for all models
- Database agnostic thanks to [Waterline ORM](http://waterlinejs.org/)
- Sophisticated Redis-based job scheduler backed by [Kue](https://github.com/Automattic/kue)
  - Updates location, ship, status for active character sockets every 5 seconds
  - Updates ship jumps, kills, pods, NPCs from ESI every 1 hour

## Roadmap
See the [Gloss README](https://github.com/dougestey/gloss).

## How to run ###
Arbiter requires a running database server as well as a Redis instance. MongoDB is configured by default, but any [Waterline-supported database](https://next.sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters) will do.

- `git clone <repository-url>` this repository
- `cd arbiter`
- `yarn` to grab deps
- `sails lift` (with Sails CLI installed) or `node app.js`

Server currently listens on :8080, this can be configured in [config/env](https://github.com/dougestey/arbiter/tree/master/config/env).

Kue web frontend will be available at :6565.

### Example routes ###
- `GET /systems`
- `GET /systems/:systemId`

## Third party APIs being considered ###
Arbiter is intended to be rich source of information for pilots on the move. This cannot be achieved with ESI alone. We're currently considering additional data sources:

| Name | Link | Features |
| --- | --- | --- |
| RedisQ | https://github.com/zKillboard/RedisQ | Live kill reports |
| zKillboard (Killmails) | https://github.com/zKillboard/zKillboard/wiki/API-(Killmails) | Rich kill information |
| zKillboard (Statistics) | https://github.com/zKillboard/zKillboard/wiki/API-(Statistics) | Combat trends, groups |
| Structure Name API | https://stop.hammerti.me.uk/api/docs/structure | Filling in CCP's Citadel gaps |
| Fleet-Up | http://fleet-up.com/Api/Endpoints | Alliance/Corp ops, doctrines |
