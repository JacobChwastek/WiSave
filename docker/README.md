# Docker assets

This folder contains Docker-related assets used by docker compose.

## Mongo init scripts

Scripts in `docker/mongo-init/` are copied into the MongoDB container's
`/docker-entrypoint-initdb.d` directory. They run only on a fresh data volume.

- `01-seed-wisave.js` seeds `wisave.Incomes_Items` if the collection is empty.

If you need to re-run init scripts, remove the MongoDB volume and start again.
