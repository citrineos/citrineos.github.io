---
title: Testing with EVerest
---

If you don't have a charger that supports OCPP 1.6, 2.0.1, or 2.1, we recommend using the Linux 
Foundation Energy project EVerest (repository [here](https://github.com/EVerest)). They have built an open-source charger 
firmware that can also be used as a simulator. They support OCPP 1.6, 2.0.1, and 2.1. To set up EVerest yourself, you can 
follow their documentation and build the project, following the docs [here](https://everest.github.io/latest/how-to-guides/getting-started/get-started-sw.html).

# Running EVerest
We have created helpful commands to run the EVerest charger simulator locally, targeting CitrineOS, with minimal configuration required.
Running these commands will start the EVerest simulator in Docker, represented through three running containers. Before running these commands, navigate to `apps/ocpp-server` directory:

    cd apps/ocpp-server

## Commands

### Running EVerest OCPP 2.1

Run the following command to start the EVerest simulator for OCPP 2.1:

    pnpm start:everest

### Running EVerest OCPP 2.0.1

Edit the package.json command for `start:everest` so it runs EVerest with OCPP 2.0.1:

    ... the remaining package.json scripts
    "start:everest": "cd ./everest && cross-env OCPP_VERSION=2.0.1 EVEREST_IMAGE_TAG=2025.6.1-dt-esdp docker compose up -d",

Then run the following command to start the EVerest simulator for OCPP 2.0.1:

    pnpm start:everest

### Running EVerest OCPP 1.6

Run the following command to start the EVerest simulator for OCPP 2.1:

    pnpm start:everest:16

## Containers

### UI
When the three EVerest containers are running in Docker, you should be able to navigate to `[localhost|ip]:1880/ui/` to view
the EVerest simulator UI, from which you can simulate events such as the pause/resume charging and plug/unplug.

### NodeRed
You can also view the EVerest NodeRed UI `[localhost|ip]:1880/`, but it is not advisable to make any adjustments here
unless you have a good understanding of this configuration.

### Manager
The `manager` container will contain any and all logs regarding the EVerest simulator.

## Changing EVerest Target URL

Running EVerest using the commands above will connect the simulator to `ws://host.docker.internal:8081/cp001` by default.
To change the target URL, you can do the following:

**1. Navigate to the `everest` folder:**

    cd apps/ocpp-server/everest

**2. Open `start.sh` in a text editor of your choice.**

**3. Edit the `EVEREST_TARGET_URL` variable to the desired URL.**

**4. Take down the EVerest containers (if they're running):**

    docker compose down

**5. Rebuild the EVerest containers:**

    docker compose build

**6. Navigate back to `ocpp-server` and rerun EVerest:**

    cd ../
    pnpm start:everest

## Viewing OCPP logs in EVerest
To view the OCPP logs in EVerest, we have utilized Node `http-server`, which you will see being initialized
in the Dockerfile. We initialize a simple HTTP server on port `8888` and expose this port so that it is
mapped in the compose file allowing you to navigate to `localhost:8888`. This HTTP server is configured to
serve the contents of the `/tmp/everest_ocpp_logs` which is where EVerest stores the OCPP logs in the
Docker container. Conveniently, the logs are in HTML format, so we can easily view them in the browser.

## Running Everest on a Mac with Apple Silicon arm64.

We have seen issues where we would see the `Syscall pipe2() failed` error in the `everest-manager` container when 
running on M1 and M2 Macs. 

![](/assets/img/everest-failing.png)

As describe in the original issue [here](https://github.com/citrineos/citrineos/issues/48#issuecomment-2622701706),
it can be resolved by disabling the **`Use Rosetta for x86_64/amd64 emulation on Apple Silicon`** checkbox in
**Docker Desktop > Settings > Virtual Machine Options**.

![](/assets/img/disable-rosetta.png)

After disabling this checkbox, the `Syscall pipe2() failed` error should go away and you should be able to see Everest
start up successfully

![](/assets/img/everest-running.png)

# Running EVerest Manually
You can also use their demo repository that hosts a Docker packaged EVerest image. [See here for Github Repo](https://github.com/EVerest/everest-demo)
To get EVerest running on the side while developing and making changes, you can follow the steps below.

1. Run your CitrineOS instance locally with `docker compose up -d` in the CitrineOS repository.
1. Clone the [EVerest Demo](https://github.com/EVerest/everest-demo) repository and `cd` into the repo.
1. With CitrineOS running execute an "add charger" script at `./citrineos/add-charger.sh` This adds a charger, location and password for the charger to CitrineOS.
1. Bring up EVerest with `docker compose --project-name everest-ac-demo --file "docker-compose.ocpp201.yml" up -d`.
1. Copy over the appropriate device model with `docker cp manager/device_model_storage_citrineos_sp1.db \
   everest-ac-demo-manager-1:/ext/source/build/dist/share/everest/modules/OCPP201/device_model_storage.db`.
1. Start EVerst having OCPP2.0.1 support with `docker exec everest-ac-demo-manager-1 sh /ext/source/build/run-scripts/run-sil-ocpp201.sh`.
