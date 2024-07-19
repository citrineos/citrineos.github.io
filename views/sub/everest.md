---
layout: default
title: Running Everest
---

# Running Everest
In order to alleviate some of the complexities that may arise when starting Everest, we have created
some helpful commands that should help in getting the Everest charger simulator running locally and targeting
CitrineOS.

You will notice in `/Server/everest` directory the new files created to support running Everest within Docker.
In addition, we created some helpful NPM commands:

- `npm run start-everest`
- and
- `npm run start-everest-windows`

Both of which in essence do the same thing which is to trigger the `docker compose up` command from within
the `/Server/everest` directory so that it can pick up the `Dockerfile` and the `docker-compose.yml` files:

```shell
EVEREST_IMAGE_TAG=0.0.16 EVEREST_TARGET_URL=ws://host.docker.internal:8081/cp001 docker-compose up
```

You will notice that there are two args that are configurable:

- `EVEREST_IMAGE_TAG` - determines the image tag that will be used for the Everest image (ghcr.io/everest/everest-demo/manager)
- `EVEREST_TARGET_URL` - the URL that Everest will point to

After running `npm run start-everest` (or the Windows alternative), you should see 3 running Everest containers
and the `manager` container should have the appropriate Everest logs.

### Viewing OCPP logs in Everest

To view the OCPP logs in Everest, we have utilized Node `http-server`, which you will see being initialized 
in the Dockerfile. We initialize a simple HTTP server on port `8888` and expose this port so that it is
mapped in the compose file allowing you to navigate to `localhost:8888`. This HTTP server is configured to
serve the contents of the `/tmp/everest_ocpp_logs` which is where Everest stores the OCPP logs in the 
Docker container. Conveniently, the logs are in HTML format, so we can easily view them in the browser.
