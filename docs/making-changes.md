---
layout: doc
title: Making Changes
---

# Making changes to CitrineOS

We recommend using the docker-compose set-up to have a stable and reproducible environment.
In the docker-compose file we wire up the local Citrine server directory to be used.
This means, the docker container running with the server is using the files that are on your machine.
We start the CitrineOS sever with `nodemon src/index.ts` so If you make adjustments to your local files, it will get picked up
and hot-reloaded in the container.


Make sure if you've made code changes since you've last run `docker compose up` that you run `docker compose down && docker compose build` before running `docker compose up` again to ensure your changes are reflected in the image docker uses when starting up the CitrineOS container.
