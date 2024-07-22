---
layout: default
title: QuickStart
---

# QuickStart

In this section we assume you have set up your local machine with the prerequisites required and found
on [Pre-Setup](/pre-setup.html)

## Installation

**1. Clone the `citrineos/core` repository onto your local machine:**

    git clone https://github.com/citrineos/citrineos-core

To include OCPI, additionally clone the `citrineos/ocpi` repository:

    git clone https://github.com/citrineos/citrineos-ocpi

**2. Navigate to the `citrineos-core/Server` directory:**

    cd citrineos-core/Server

**3. Start the entire `citrineos-core` stack with docker-compose:**

    docker compose up -d

Alternatively, to start with OCPI:

    docker compose -f docker-compose.with.ocpi.yml build    

### After Setup

You now have a running CitrineOS server plus the supporting infrastructure, in this case:

- A [Directus](http://directus.io) server for which the web interface can now be reached
  at [localhost:8055](http://localhost:8055) with the initial credentials `admin@citrineos.com:CitrineOS!`

- A [Postgres Database](https://www.postgresql.org) pre-seeded with the OCPP 2.0.1 schemas as well as an initial
  Directus setup.
  The initialized database is named `citrine` with a username: `citrine` and password: `citrine`

- [RabbitMQ](http://rabbitmq.com) for the OCPP 2.0.1 message bus

- [Redis](https://redis.io/) cache; the default settings will use an in-memory cache but the redis instance is available to use.

- OCPP Citrine Server running the CSMS. You can retrieve the generated OpenAPI docs at [localhost:8080/docs](http://localhost:8080/docs). There is an unsecured websocket server (security profile '0') at `ws://localhost:8081`, and a security profile 1 websocket server at `ws://localhost:8082`.

- If Citrine Server was started with OCPI enabled, you can retrieve the generated OpenAPI docs at [localhost:8085/docs](http://localhost:8085/docs).

> Please consider that this setup is the development environment and **do not** simply deploy it to an exposed
> environment with initial passwords!

### Configuration

We recommend running and developing the project with the `docker-compose` set-up.

However, if you like to rather run it locally and need to adjust where the server is connecting to, please locally (only)
adjust the configuration file at `./Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start-unix
```

You may run into issues attempting this on a Windows DOS command line, in which case `npm run start-windows` is available. Both of these commands set the APP_NAME and APP_ENV environment variables; if you wish to set those yourself, you can use `npm run start-docker`.


### Usage

#### Connecting a Charger to CitrineOS

If you want to now connect a charger to CitrineOS, you can do so without any set up, just point the charger to `ws://localhost:8081`. Depending on the charger you are using, you may need to append the station id to the url like so `ws://localhost:8081/<stationId>`. Some chargers take care of this automatically.

In Directus, the `Boot` table can be used to both review the most recent boot status as well as set a boot status for the next `BootNotificationRequest` received from the charging station. After a successful boot, the status is set to `Accepted`. If you wish to fetch the device model from the charger as part of the boot process described in the B02 use case of part 2 of the OCPP 2.0.1 protocol, set the status to `Pending` and check the 'Get Base Report On Pending' option. This will cause the next boot to be responded to with a `BootNotificationResponse` that has status `Pending`, then CitrineOS will send a `GetBaseReportRequest`, triggering a series of `NotifyReportRequest` messages. After the full report has been sent, the next attempted boot by the charger will be `Accepted`. 

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

If you want to add a password for security profile 1 and 2, send the following request to the CitrineOS API.

```shell
curl --location --request POST 'localhost:8080/data/configuration/password?callbackUrl=csms.pro/api/notifications' \
--header 'Content-Type: application/json' \
--data '{
  "stationId": "cp001",
  "password": "DbkTu048=xueA69@-dB94hjV*fGdyQOzgVuhhH1L",
  "setOnCharger": false
}'
```
Please note that the `password` should be sent in plain text and should not be hashed.

Set `setOnCharger` to true if the password has already been updated on the charger and you only need to update the device model associated with the station id.
If you need to update the password on the charger (OCPP A01 use case), set `setOnCharger` to false.

Providing a `password` is mandatory only when `setOnCharger` is true. This prevents the possibility of updating the device model with an autogenerated password without updating the charger itself.

If you do not provide a `password`, it will be automatically generated.
If you do provide one, it must comply with the OCPP specification.

#### Testing

In the case you don't have a charger that supports OCPP 2.0.1 to experiment with, we can recommend using the Linux Foundation Energy project EVerest.
[See here](https://github.com/EVerest) for the repository.
They have built an open source version of charger firmware and also allow for using it as a simulator.
They support OCPP 2.0.1 which makes it a great testing opportunity with CitrineOS.
For the long route of setting up EVerst you can follow their documentation and build the project yourself.[See here for Docs](https://everest.github.io/latest/general/03_quick_start_guide.html)

As a short-cut you can also use their demo repository that hosts a Docker packaged EVerest image. [See here for Github Repo](https://github.com/EVerest/everest-demo)

If you want to run EVerest on the side while developing and making changes, you can follow the steps below.
1. Run your citrine instance locally with `docker compose up -d` in the Citrine repository
1. Clone the [EVerest Demo](https://github.com/EVerest/everest-demo) repository and `cd` into the repo
1. With citrine running excute an "add charger" script at `./citrineos/add-charger.sh` This adds a charger, location and password for the charge to Citrine
1. Bring up EVerest with `docker compose --project-name everest-ac-demo --file "docker-compose.ocpp201.yml" up -d`
1. Copy over the appropriate device model with `docker cp manager/device_model_storage_citrineos_sp1.db \
   everest-ac-demo-manager-1:/ext/source/build/dist/share/everest/modules/OCPP201/device_model_storage.db`
1. Start EVerst having OCPP2.0.1 support with `docker exec everest-ac-demo-manager-1 sh /ext/source/build/run-scripts/run-sil-ocpp201.sh` 


#### Making changes to CitrineOS

As mentioned above, we recommend using the docker-compose set-up to have a stable and reproducible environment.
In the docker-compose file we wire up the local Citrine server directory to be used.
This means, the docker container running with the server is using the files that are on your machine.
We start the CitrineOS sever with `nodemon src/index.ts` so If you make adjustments to your local files, it will get picked up
and hot-reloaded in the container.


Make sure if you've made code changes since you've last run `docker compose up` that you run `docker compose down && docker compose build` before running `docker compose up` again to ensure your changes are reflected in the image docker uses when starting up the CitrineOS container.
