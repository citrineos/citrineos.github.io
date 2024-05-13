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
[+] Running 5/6
 - Network server_default          Created                                 28.0s
 ✔ Container server-amqp-broker-1  Healthy                                19.3s
 ✔ Container server-ocpp-db-1      Healthy                                11.4s
 ✔ Container server-redis-1        Healthy                                16.3s
 ✔ Container server-directus-1     Healthy                                27.1s
 ✔ Container server-citrine-1      Started                                27.7s
    ```

### After Setup

You now have a running CitrineOS server plus the supporting infrastructure, in this case:

- A [Directus](http://directus.io) server for which the web interface can now be reached at [localhost:8055](http://localhost:8055) with the initial credentials `admin@citrineos.com:CitrineOS!`

- A [Postgres Database](https://www.postgresql.org) pre-seeded with the OCPP 2.0.1 schemas as well as an initial Directus setup.
    The initialized database is named `citrine` with a username: `citrine` and password: `citrine`

- [RabbitMQ](http://rabbitmq.com) for the OCPP 2.0.1 message bus

- [Redis](https://redis.io/) cache; the default settings will use an in-memory cache but the redis instance is available to use.

- OCPP Citrine Server running the CSMS. You can retrieve the generated OpenAPI docs at [localhost:8080/docs](http://localhost:8080/docs). There is an unsecured websocket server (security profile '0') at `ws://localhost:8081`, and a security profile 1 websocket server at `ws://localhost:8082`.

> Please consider that this setup is the development environment and **do not** simply deploy it to an exposed environment with initial passwords!

### Configuration

We recommend running and developing the project with docker-compose set-up.

However if you like to rather run it locally and need to adjust where the server is connecting to, please locally (only) adjust the configuration file at `Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start-unix
```

You may run into issues attempting this on a Windows DOS command line, in which case `npm run start-windows` is available. Both of these commands set the APP_NAME and APP_ENV environment variables; if you wish to set those yourself, you can use `npm run start-docker`.


### Usage

#### Connecting a Charger to CitrineOS

If you want to now connect a charger to CitrineOS, you can do so without any set up, just point the charger to `ws://localhost:8081`. Depending on the charger you are using, you may need to append the station id to the url like so `ws://localhost:8081/<stationId>`. Some chargers take care of this automatically.

In Directus, the `Boot` table can be used to both review the most recent boot status as well as set a boot status for the next `BootNotificationRequest` received from the charging station. After a successful boot, the status is set to `Accepted`. If you wish to fetch the device model from the charger as part of the boot process described in the B02 use case of the protocol, set the status to `Pending` and check the 'Get Base Report On Pending' option. This will cause the next boot to be responded to with a `BootNotificationResponse` that has status `Pending`, then CitrineOS will send a `GetBaseReportRequest`, triggering a series of `NotifyReportRequest` messages. After the full report has been sent, the next attempted boot by the charger will be `Accepted`. 

The `Boot` table has CRUD endpoints in order to be manipulated via REST API, of which the docs can be found here (if you have CitrineOS running locally): [localhost:8080/docs](http://localhost:8080/docs)
Here is an example request for charge point `cp001`:

```shell
curl --location --request PUT 'http://localhost:8080/data/configuration/boot?stationId=cp001' \
--header 'Content-Type: application/json' \
--data '{ "status": "Pending" }'
```

#### Using Security Profile 1

There are two layers of security available before the charger has the opportunity to send an OCPP message such as `BootNotificationRequest`. When the charger attempts to connect, it can be rejected at the transport layer if the websocket server is using security profiles 2 or 3. Otherwise, the http upgrade request occurs. The charger's upgrade request can be rejected if:

- The request's subprotocol header is incorrect. The default websocket servers used by CitrineOS accept only 'ocpp2.0.1'.

- The charging station's Id, as set in the url it connected with, is not known. This option can be toggled in the SystemConfig object used by CitrineOS, and is enabled by default only for the security profile 1 websocket server at `:8082`. To enter a charger into CitrineOS, use Directus. Navigate to the Charging Station collection, then create and save a new entry for your charging station. Make sure the Id of your new entry is the charging station's station id as set in the url it uses to connect to CitrineOS.

- The websocket server is using security profiles 1 or 2 and the request's Authorization header has an incorrect username or password. The username will be checked against the charging station's id as set in the url it connected with. The password will be checked against the device model associated with the station id. Specifically, it will be the `Actual` Variable Attribute's value that belongs to the `BasicAuthPassword` Variable on the `SecurityCtrlr` Component. You can set this VariableAttribute on the CSMS side using the Variable Attribute CRUD endpoints on the Monitoring module. You can set this VariableAttribute on the Charging Station side using the SetVariables message, which can be sent from CitrineOS using the Monitoring module's message API.

Once a charger has a Charging Station entry and its password has been set, you can connect it to the security profile 1 websocket server at `ws://localhost:8082`.

#### Making changes to CitrineOS

As mentioned above, we recommend using the docker-compose set-up to have a stable and reproducible environment.
In the docker-compose file we wire up the local citrine server directory to be used.
This means, the docker container running with the server is using the files that are on your machine.
We start the citrineOS sever with `npx nodemon` so If you make adjustments to your local files, it will get picked up and hot-reloaded in the container.

However, if you are making changes to the dependent packages, you will need to re-install the dependent package to the server and restart it.
