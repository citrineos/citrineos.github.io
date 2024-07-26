---
layout: doc
title: Testing (Everest)
---

# Testing

In the case you don't have a charger that supports OCPP 2.0.1 to experiment with, we can recommend using the Linux 
Foundation Energy project EVerest. [See here](https://github.com/EVerest) for the repository.  They have built an open source version of
charger firmware and also allow for using it as a simulator. They support OCPP 2.0.1 which makes it a great testing 
opportunity with CitrineOS. For the long route of setting up EVerst you can follow their documentation and build 
the project yourself.[See here for Docs](https://everest.github.io/latest/general/03_quick_start_guide.html)

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
- `EVEREST_TARGET_URL` - the URL that Everest will point to. Defaulting to `host.docker.internal` assuming CitrineOS will run on
  same machine, since `localhost` won't work within Docker

After running `npm run start-everest` (or the Windows alternative), you should see 3 running Everest containers
and the `manager` container should have the appropriate Everest logs.

### Everest UI
Now that the 3 containers are running in Docker, you should be able to navigate to `[localhost|ip]:1880/ui/` to view
the Everest simulator UI. There, you should be able to simulate the pause/resume and plug/unplug events among others.

### Everest NodeRed
You can also view the Everest NodeRed UI `[localhost|ip]:1880/`, but it is not advisable to make any adjustments here
unless you have a good understanding of this configuration.

### Viewing OCPP logs in Everest
To view the OCPP logs in Everest, we have utilized Node `http-server`, which you will see being initialized
in the Dockerfile. We initialize a simple HTTP server on port `8888` and expose this port so that it is
mapped in the compose file allowing you to navigate to `localhost:8888`. This HTTP server is configured to
serve the contents of the `/tmp/everest_ocpp_logs` which is where Everest stores the OCPP logs in the
Docker container. Conveniently, the logs are in HTML format, so we can easily view them in the browser.

# Running Everest Manually
You can also use their demo repository that hosts a Docker packaged EVerest image. [See here for Github Repo](https://github.com/EVerest/everest-demo)

To get EVerest running on the side while developing and making changes, you can follow the steps below.
1. Run your citrine instance locally with `docker compose up -d` in the Citrine repository
1. Clone the [EVerest Demo](https://github.com/EVerest/everest-demo) repository and `cd` into the repo
1. With citrine running excute an "add charger" script at `./citrineos/add-charger.sh` This adds a charger, location and password for the charge to Citrine
1. Bring up EVerest with `docker compose --project-name everest-ac-demo --file "docker-compose.ocpp201.yml" up -d`
1. Copy over the appropriate device model with `docker cp manager/device_model_storage_citrineos_sp1.db \
   everest-ac-demo-manager-1:/ext/source/build/dist/share/everest/modules/OCPP201/device_model_storage.db`
1. Start EVerst having OCPP2.0.1 support with `docker exec everest-ac-demo-manager-1 sh /ext/source/build/run-scripts/run-sil-ocpp201.sh`
