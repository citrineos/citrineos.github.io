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
2. `dal` - The data access layer, such as database repositories and models.
3. `ocpp` - Modules handling business logic and data layer.
4. `ocpi` - OCPI interfaces and types, utilities, and configurations.
5. `types` - Types that are shared amongst all modules.

### Modules

Each module is separated into logical groups of the business logic for OCPP functionality.

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

### Handlers

The logic for processing OCPP messages can be found in the individual handlers named after the event they handle. Every
module registers the set of handlers related to the messages they should be able to handle.
