---
title: Architecture
---

# High-Level Architecture

Citrine is a Charging Station Management System (CSMS) that supports OCPP 1.6, 2.0.1, and 2.1 protocols, designed to be adaptable to various infrastructures and easily extensible via modular design. It uses the [fastify](https://github.com/fastify/fastify) web framework.

Below is a diagram to introduce you to Citrine's high-level architecture:

    ┌───────────────────┐                         ┌───────────────────┐
    │ Charging Stations │                         │   Operator UI     │
    │  (OCPP 1.6 &      │                         │ (Next.js + Refine)│
    │   2.0.1)          │                         └───┬───────────┬───┘
    └────────┬──────────┘                  REST (Data │           │ GraphQL
             │ WebSocket                & Message API)│           │
             ▼                                        ▼           ▼
    ┌───────────────────┐                 ┌───────────────────┐ ┌──────────────┐
    │  CitrineOS Server │                 │  CitrineOS Server │ │   Hasura     │
    │  (OCPP Router +   │                 │   (HTTP / REST)   │ │GraphQL Engine│
    │   Modules)        │                 └───────────────────┘ └──────┬───────┘
    └────────┬──────────┘                                              │
             │                                                         │
       ┌─────┴─────────┐                    ┌─────────────┐            │
       ▼               ▼                    │ File Storage│            ▼
    ┌─────────────┐ ┌─────────────┐         │ (S3 / GCS / │      ┌─────────────┐
    │ Message     │ │ PostgreSQL  │         │  MinIO)     │      │ PostgreSQL  │
    │ Broker      │ │ (PostGIS)   │         └─────────────┘      │ (PostGIS)   │
    │ (RabbitMQ)  │ │ Persistence │                              │ (same DB)   │
    └─────────────┘ └─────────────┘                              └─────────────┘


# Codebase Structure
The code is organized into two main folders:

1. `apps` - Runnable applications (servers and web interfaces)
2. `packages` - Shared libraries and utilities used by `apps`

## apps

1. `ocpi-server` - [README](https://github.com/citrineos/citrineos-core/blob/main/apps/ocpi-server/README.md)
2. `ocpp-server` - [README](https://github.com/citrineos/citrineos-core/blob/main/apps/ocpp-server/README.md)
3. `operator-ui` - [README](https://github.com/citrineos/citrineos-core/blob/main/apps/operator-ui/README.MD) 

## packages

1. `base` - OCPP interfaces and types, utilities, and configurations.
2. `core` - Modules handling business logic and data layer.
3. `ocpi-base` - OCPI interfaces and types, utilities, and configurations.

### Decorators
We make use of custom decorators that define methods to be used for specific logic use cases.

- `@AsHandler`:Defines a method as an OCPP call handler that listens for specific OCPP messages types from the message broker.
- `@AsMessageEndpoint`: Defines a method as a Fastify-exposed API endpoint that takes in HTTP requests that are sent to a charging station.
- `@AsDataEndpoint`: Defines a method as a Fastify-exposed API endpoint that exposes CRUD functionality for entities defined in the 01_Data package.


### Modules

Each module is separated into logical groups of the business logic for OCPP functionality. 
The structure for each module is similar, usually including the following components:

- `DataApi.ts`: Defines API endpoints specific to data-related interactions.
- `1.6/MessageApi.ts`: Defines API endpoints specific to OCPP 1.6 messages.
- `2/MessageApi.ts`: Defines API endpoints specific to OCPP 2.0.1 / 2.1 messages.
- `module.ts`: Holds the `@AsHandler` decorated methods that handle OCPP messages. Here you will also find the supported call actions listed in an array at the top.
- `services.ts`: Offers the deeper logic for the OCPP functional Blocks and is called by the methods in `module.ts`.

#### Certificates

Handles certificate management, especially relevant for ISO15118. Certificates are also used to maintain websocket and OTA firmware update security.

#### Configuration

Handles the configuration of the Charging Station. Example messages are `BootNotification` and `Reset`.

#### EVDriver

Handles driver-related functionality. Example messages are `Authorize` and `RequestStartTransaction`.

#### Monitoring

Handles monitoring-related functionality. Example message are `NotifyEvent` and `SetVariables`.

#### OCPPRouter

Handles the OCPP messages and routes them to and from the correct charger. You can also register callbacks for 
websocket events or specific OCPP messages to be executed in the future.

#### Reporting

Handles reporting-related functionality. Example message are `SecurityEventNotification` and `GetBaseReport`.

#### SmartCharging

Handles smart charging-related functionality. Example message are `ReportChargingProfiles` and `SetChargingProfile`.

#### Tenant

Handles tenant-related functionality.

#### Transactions

Handles transaction-related functionality. Example message are `TransactionEvent` and `CostUpdated`.


