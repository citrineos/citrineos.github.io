---
layout: default
title: QuickStart
---

# QuickStart

In this section we assume you have set up your local machine with the prerequisites required and found
on [Pre-Setup](/pre-setup.html)

## Installation

1. Clone the CitrineOS repository to your local machine:

    ```shell
    git clone https://github.com/citrineos/citrineos-core
    ```

1. Navigate to the `citrineos-core` directory and run npm install:

    ```shell
    npm run install-all
    ```

    This will install all modules in the `citrineos-core` directory in a verbose setting to give more context on what is going on.
    For a silent install you can use `npm install`

    We have set up our mono-repo using [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces), which means our modules are set as dependencies in a workspace in the root directory.
    This allows to install all modules in a single command.


1. We have an example on how to run all CitrineOS modules on your machine. 
    We use the example in the `Server` directory for our local testing and development. 
    For this, navigate to `./Server` where you can now you can run the entire required stack with docker-compose.

    ```shell
    cd ./Server
    docker-compose up -d 
    ```

    The expected outcome should look like this:
    
    ```shell
    [+] Running 5/5
    ✔ Container server-redis-1        Healthy                                                                                                                                                                  0.0s
    ✔ Container server-amqp-broker-1  Healthy                                                                                                                                                                  0.0s
    ✔ Container server-ocpp-db-1      Healthy                                                                                                                                                                  0.0s
    ✔ Container server-directus-1     Started                                                                                                                                                                  0.0s
    ✔ Container server-citrine-1      Started
    ```

### After Setup

You now have a running CitrineOS server plus the supporting infrastructure, in this case:

- A [Directus](http://directus.io) server for which the web interface can now be reached
  at [localhost:8055](http://localhost:8055) with the initial credentials `admin@citrineos.com:CitrineOS!`

- A [Postgres Database](https://www.postgresql.org) pre-seeded with the OCPP 2.0.1 schemas as well as an initial
  Directus setup.
  The initialized database is named `citrine` with a username: `citrine` and password: `citrine`

- [RabbitMQ](http://rabbitmq.com) for the OCPP 2.0.1 message bus

- OCPP Citrine Server running the CSMS. You can retrieve the generated OpenAPI docs
  at [localhost:8080/docs](http://localhost:8080/docs)

> Please consider that this setup is the development environment and **do not** simply deploy it to an exposed
> environment with initial passwords!

### Configuration

We recommend running and developing the project with the `docker-compose` set-up.

However, if you like to rather run it locally and need to adjust where the server is connecting to, please locally (only)
adjust the configuration file at `./Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start-unix:local
```

### Usage

#### Connecting a Charger to CitrineOS

If you want to now connect a charger to CitrineOS, you must add it's id to the allowed list of chargerIds in the
database.
Either enter the chargerId into the database via Directus to the `BootNotification` table where the status is set
to `Accepted` or make a HTTP request that interacts with the REST API, of which the docs can be found
here: [localhost:8080/docs](http://localhost:8080/docs)
Here is an example request for charge point `cp001`:

```shell
curl --location --request PUT 'http://localhost:8080/data/provisioning/bootNotification?stationId=cp001' \
--header 'Content-Type: application/json' \
--data '{"currentTime":"", "interval": 0, "status": "Accepted"}'
```

Now point your charger to your local machine and port `:8081` for the web-socket connection with security profile 0.

If you want to add a password for security profile 1, send the following request to the CitrineOS API.

```shell
curl --location --request PUT 'localhost:8080/data/monitoring/variableAttribute?stationId=cp001&setOnCharger=true' \
--header 'Content-Type: application/json' \
--data '{
    "component": {
        "name": "SecurityCtrlr"
    },
    "variable": {
        "name": "BasicAuthPassword"
    },
    "variableAttribute": [
        {
            "value": "testing-citrine"
        }
    ],
    "variableCharacteristics": {
        "dataType": "passwordString",
        "supportsMonitoring": false
    }
}'
```

#### Testing

In the case you don't have a charger that supports OCPP 2.0.1 to experiment with, we can recommend using the Linux Foundation Energy project EVerest.[See here](https://github.com/EVerest) for the repository.
They have built an open source version of Charger Firmware and also allow for using it as a simulator.
They support OCPP 2.0.1 which makes it a great testing opportunity with CitrineOS.
For the long route of setting up EVerst you can follow their documentation and build the project yourself.[See here for Docs](https://everest.github.io/latest/general/03_quick_start_guide.html)
As a short cut you can also use their demo repository that hosts a Docker packaged EVerest image. [See here for Github Repo](https://github.com/EVerest/everest-demo)





#### Making changes to CitrineOS

As mentioned above, we recommend using the docker-compose set-up to have a stable and reproducible environment.
In the docker-compose file we wire up the local Citrine server directory to be used.
This means, the docker container running with the server is using the files that are on your machine.
We start the CitrineOS sever with `nodemon src/index.ts` so If you make adjustments to your local files, it will get picked up
and hot-reloaded in the container.

