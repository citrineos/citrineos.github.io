---
layout: doc
title: Getting Started
---

# Getting Started

In this section, we assume you have set up the necessary [prerequisites](/docs/prerequisites.html).

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

You should now have the following services running:

| Service                                       | URL                                                                                          | Description                                                                                                                                  |
|-----------------------------------------------|----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **Citrine OCPP HTTP Server**                  | [http://localhost:8080](http://localhost:8080)                                               | See [localhost:8080/docs](http://localhost:8080/docs) for full details.                                                                      |
| **Citrine OCPP WebSocket Server (Unsecured)** | [ws://localhost:8081](ws://localhost:8081)                                                   | OCPP WebSocket Server running security profile 0.                                                                                            |
| **Citrine OCPP WebSocket Server (Secured)**   | [wss://localhost:8082](wss://localhost:8082)                                                 | OCPP WebSocket Server running security profile 1.                                                                                            |
| **Citrine OCPI Server**                       | [http://localhost:8085](http://localhost:8085)                                               | See [localhost:8085/docs](http://localhost:8085/docs) for full details.                                                                      |
| **Directus**                                  | [http://localhost:8055](http://localhost:8055)                                               | [Directus](http://directus.io) server for which the web interface can now be accessed with the credentials `admin@citrineos.com:CitrineOS!`. |
| **Postgres Database**                         | [postgressql://citrine:citrine@localhost:5432](postgressql://citrine:citrine@localhost:5432) | [Postgres Database](https://www.postgresql.org) pre-seeded with OCPP 2.0.1 and Directus schemas. The database is named `citrine`.            |
| **RabbitMQ**                                  | [amqp://guest:guest@localhost:5672](amqp://guest:guest@localhost:5672)                       | [RabbitMQ](http://rabbitmq.com) message bus.                                                                                                 |
| **Redis**                                     | N/A                                                                                          | The default settings will use an in-memory cache but a [Redis](https://redis.io/) instance is available to use.                                                        |

Quickly verify the connection to the server by using `wscat` to send an `BootNotification`:
```
wscat -c ws://localhost:8081 -x '[
  2,
  "15106be4-57ca-11ee-8c99-0242ac120003",
  "BootNotification",
  {
    "reason": "PowerUp",
    "chargingStation": {
      "model": "SingleSocketCharger",
      "vendorName": "VendorX"
    }
  }
]'
```

### Configuration

We recommend running and developing the project with the `docker-compose` set-up.

However, if you like to rather run it locally and need to adjust where the server is connecting to, please locally adjust the configuration file at `./Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start
```

This command will set the APP_NAME and APP_ENV environment variables; if you wish to set those yourself, you can use `npm run start-docker`.
