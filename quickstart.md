---
layout: default
title: QuickStart
---

# QuickStart

In this section we assume you have set up your local machine with the prerequisites required and found on [Pre-Setup](/pre-setup.html)

## Installation

1. Clone the CitrineOS repository to your local machine:

    ```shell
    git clone https://github.com/citrineos/citrineos-core
    ```

1. Navigate to the `citrineos-core/Server` directory and run the entire required stack with docker-compose.

    ```shell
    cd citrineos-core/Server
    docker-compose up -d 
    ```

    The expected outcome should look like this:

    ```shell
    [+] Building 0.0s (0/0)  docker:desktop-linux

    [+] Running 4/4

    ✔ Container 50_server-ocpp-db-1      Started  0.0s

    ✔ Container 50_server-directus-1     Started   0.0s

    ✔ Container 50_server-amqp-broker-1  Healthy   0.0s

    ✔ Container 50_server-citrine-1      Created  0.0s
    ```

### After Setup

You now have a running CitrineOS server plus the supporting infrastructure, in this case:

- A [Directus](http://directus.io) server for which the web interface can now be reached at [localhost:8055](http://localhost:8055) with the initial credentials `admin@citrineos.com:CitrineOS!`

- A [Postgres Database](https://www.postgresql.org) pre-seeded with the OCPP 2.0.1 schemas as well as an initial Directus setup.
    The initialized database is named `citrine` with a username: `citrine` and password: `citrine`

- [RabbitMQ](http://rabbitmq.com) for the OCPP 2.0.1 message bus

- OCPP Citrine Server running the CSMS. You can retrieve the generated OpenAPI docs at [localhost:8080/docs](http://localhost:8080/docs)

> Please consider that this setup is the development environment and **do not** simply deploy it to an exposed environment with initial passwords!

### Configuration

We recommend running and developing the project with docker-compose set-up.

However if you like to rather run it locally and need to adjust where the server is connecting to, please locally (only) adjust the configuration file at `50_Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start-unix:local
```

### Usage

#### Connecting a Charger to CitrineOS

If you want to now connect a charger to CitrineOS, you must add it's id to the allowed list of chargerIds in the database.
Either enter the chargerId into the database via Directus to the `BootNotification` table where the status is set to `Accepted` or make a HTTP request that interacts with the REST API, of which the docs can be found here: [localhost:8081/docs](http://localhost:8081/docs)
Here is an example request for charge point `cp001`:

```shell
curl --location --request PUT 'http://localhost:8081/data/provisioning/bootNotification?stationId=cp001' \
--header 'Content-Type: application/json' \
--data '{"currentTime":"", "interval": 0, "status": "Accepted"}'
```

Now point your charger to your local machine and port `:8080` for the web-socket connection.

#### Making changes to CitrineOS

As mentioned above, we recommend using the docker-compose set-up to have a stable and reproducible environment.
In the docker-compose file we wire up the local citrine server directory to be used.
This means, the docker container running with the server is using the files that are on your machine.
We start the citrineOS sever with `npx nodemon` so If you make adjustments to your local files, it will get picked up and hot-reloaded in the container.

However, if you are making changes to the dependent packages, you will need to re-install the dependent package to the server and restart it.
