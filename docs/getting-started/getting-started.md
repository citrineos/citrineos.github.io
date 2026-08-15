---
layout: doc
title: Getting Started
---

# Getting Started running Citrine Core

In this section, we assume you have set up the necessary [prerequisites](prerequisites.md).

## Installation

**1. Clone the `citrineos/core` repository onto your local machine:**

    git clone https://github.com/citrineos/citrineos-core

**2. Navigate into the repository:**

    cd citrineos-core

**3. Start the entire `citrineos-core` stack with docker-compose:**

    docker compose up -d

You should now have the following services running:

| Service                                       | URL                                                                                          | Description                                                                                                                                                                                                          |
|-----------------------------------------------|----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Citrine OCPP HTTP Server**                  | [http://localhost:8080](http://localhost:8080)                                               | See [localhost:8080/docs](http://localhost:8080/docs) for full details.                                                                                                                                              |
| **Citrine OCPP 2.0.1 WebSocket Server (Unsecured)** | [ws://localhost:8081](ws://localhost:8081)                                                   | OCPP 2.0.1 WebSocket Server running security profile 0.                                                                                                                                                              |
| **Citrine OCPP 2.0.1 WebSocket Server (Secured)**   | [wss://localhost:8082](wss://localhost:8082)                                                 | OCPP 2.0.1 WebSocket Server running security profile 1.                                                                                                                                                              |
| **Citrine OCPP 1.6 WebSocket Server**   | [wss://localhost:8092](wss://localhost:8092)                                                 | OCPP 1.6 WebSocket Server.                                                                                                                                                                                           |
| **Postgres Database**                         | [postgressql://citrine:citrine@localhost:5432](postgressql://citrine:citrine@localhost:5432) | [Postgres Database](https://www.postgresql.org) pre-seeded with OCPP 2.0.1 schemas. The database is named `citrine`. <b>Please note:</b> Docker compose automaitcally enables Postgis in Postgres which is required. |
| **RabbitMQ**                                  | [amqp://guest:guest@localhost:5672](amqp://guest:guest@localhost:5672)                       | [RabbitMQ](http://rabbitmq.com) message bus.                                                                                                                                                                         |
| **Redis**                                     | N/A                                                                                          | The default settings will use an in-memory cache but a [Redis](https://redis.io/) instance is available to use.                                                                                                      |

Quickly verify the connection to the server by using `wscat` to connect and send a `BootNotification`.

First, connect to the server:
```bash
wscat -c ws://localhost:8081/{STATION_ID} -s ocpp2.0.1
```

Then, paste the following `BootNotification` message into the prompt and press Enter.

> **Note:** `wscat` reads input line-by-line, so the JSON message **must** be pasted as a single line:

```json
[2, "15106be4-57ca-11ee-8c99-0242ac120003", "BootNotification", {"reason": "PowerUp", "chargingStation": {"model": "SingleSocketCharger", "vendorName": "VendorX"}}]
```

*(Formatted view for readability):*
```json
[
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
]
```

You should receive a response indicating the boot was accepted, which confirms the app is working:
```json
[
  3,
  "15106be4-57ca-11ee-8c99-0242ac120003",
  {
    "currentTime": "2023-10-18T12:00:00.000Z",
    "interval": 60,
    "status": "Accepted"
  }
]
```

### Running Operator UI (Beta)

To run the new beta Operator UI, follow the instructions in the [Operator UI repo](https://github.com/citrineos/citrineos-operator-ui?tab=readme-ov-file#citrineos-operator)

### Configuration

We recommend running and developing the project with the `docker-compose` set-up.

However, if you like to rather run it locally and need to adjust where the server is connecting to, please locally adjust the configuration file at `./Server/src/config/envs/local.ts`

You can now use the npm run command to start with your environment setup:

```shell
npm run start
```

This command will set the `APP_NAME` and `APP_ENV` environment variables; if you wish to set those yourself, you can use `npm run start-docker`.

### Running CORE with OCPI
To run CORE with OCPI you should follow the steps in the [Running OCPI](running-ocpi.md) section.
