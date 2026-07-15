---
layout: doc
title: Getting Started
---

In this section, we assume you have set up the necessary [prerequisites](prerequisites.md).

# Installation

**1. Clone the `citrineos/core` repository onto your local machine:**

    git clone https://github.com/citrineos/citrineos-core

**2. Install all workspace dependencies from the root directory:**

    pnpm install

**3. Build all packages from the root directory:**

    pnpm build

# Running with Docker

In the repository root, you can execute one of the following commands to spin up a complete CitrineOS environment in Docker:

    pnpm citrine            # ocpp-server + operator UI from published ghcr.io images
    pnpm citrine --local    # ocpp-server + operator UI from local source instead of pulling
    pnpm citrine --solo     # ocpp-server only (no operator UI)

If you want to run OCPI with the remaining stack:

    pnpm citrine --ocpi     # also run the OCPI server from published ghcr.io images

Note the flags combine freely:

    pnpm citrine --local --ocpi

Once running, quickly verify the connection to the server by using `wscat` to send an `BootNotification`:

    wscat -c ws://localhost:8081/{STATION_ID} -x '[
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

## Services

You can access the following services at the specified URLs:

| Service                               | URL                                                                                          | Description                                                                                                                                                                                                    |
|---------------------------------------|----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **OCPP HTTP Server**                  | [http://localhost:8080](http://localhost:8080)                                               | See [localhost:8080/docs](http://localhost:8080/docs) for full details.                                                                                                                                        |
| **OCPP WebSocket Server (Unsecured)** | [ws://localhost:8081](ws://localhost:8081)                                                   | OCPP WebSocket Server running security profile 0. Supports all protocols (1.6, 2.0.1, 2.1).                                                                                                                    |
| **OCPP WebSocket Server (Secured)**   | [wss://localhost:8082](wss://localhost:8082)                                                 | OCPP 2.0.1 WebSocket Server running security profile 1. Supports all protocols (1.6, 2.0.1, 2.1).                                                                                                              |
| **Postgres Database**                 | [postgressql://citrine:citrine@localhost:5432](postgressql://citrine:citrine@localhost:5432) | [Postgres Database](https://www.postgresql.org) pre-seeded with OCPP schemas. The database is named `citrine`. <b>Please note:</b> Docker compose automaitcally enables Postgis in Postgres which is required. |
| **RabbitMQ**                          | [amqp://guest:guest@localhost:5672](amqp://guest:guest@localhost:5672)                       | [RabbitMQ](http://rabbitmq.com) message bus.                                                                                                                                                                   |
| **Operator UI**                       | [http://localhost:3000](http://localhost:3000)                                               | Web-based Operator interface for CitrineOS.                                                                                                                                                                    |
| **OCPI HTTP Server**                  | [http://localhost:8085](http://localhost:8085)                                               | See [localhost:8085/docs](http://localhost:8085/docs) for full details (if the `--ocpi` flag was used).                                                                                                        |

## Stopping Docker

If you want to take down the containers:

    pnpm citrine down       # stop the stack (pass the same flags you started it with)
