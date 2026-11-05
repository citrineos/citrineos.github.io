---
title: CitrineOS 1.x to 2.x
---

/// admonition | Prior to upgrading to version 2.x, if you have existing data, do not run the Sequelize migrations as they may cause data loss.
    type: warning

You can turn off the migrations by setting the DB_STRATEGY to "none" in the docker-compose or entrypoint.sh.
///

# Breaking Changes

## [DATABASE] Station ID -> OCPP Connection Name

Charging Station "human-readable" identifiers are now stored in the `ocppConnectionName` column, while the `id` column
became the dedicated database serial integer identifier. As a result, every related entity to Charging Stations had to
be updated so that their `stationId` references the Charging Station's `id` integer column, rather than the
`ocppConnectionName` string column. All related indexes were also updated to reflect this change.

If you have skipped the migration due to existing data, as warned above, you will need to ensure that all tables
referencing `stationId` as the Charging Station's string value `ocppConnectionName` are updated to reference the proper
Charging Station `id` serial integer column.

You can find an example of how to craft the necessary SQL in the migration file `apps/ocpp-server/db/migrations/20260427000000-rename-charging-station-columns.ts`.

Note that if you are on version 1.9.x, you can follow the example of the migration above, as it runs against the
`stationPkId` column. If you are on a version prior to 1.9.x, the column to migrate will be `stationId`.

### OCPP Connection Name in endpoints

Any query parameters previously referencing stationId now use ocppConnectionName instead. You can see the updated API 
definitions [here](../apis/core-api).

### Station ID foreign key

In addition to the rename, any relevant tables where they need to refer back to a charging station nows reference the 
charging station by the **generated database id** stored in the column `stationId`, rather than using `ocppConnectionName`,
to ensure the data is properly linked together.

## [DATABASE] Additional OCPPMessage columns

This is not a breaking change if you're not reliant on a particular OCPPMessage structure. OCPPMessage deprecated the
`state` and `message` columns (though they are still written to for backwards compatability) in favor of `type`, `payload`, 
and `raw`. `state` was replaced by `type` because the latter stores the actual OCPP Message Type. `message` was replaced 
by `payload` (the parsed payload) and `raw` (the raw OCPP message received).

## [DATABASE] Table Partitions

The `OCPPMessages` and `Transactions` tables now use PostgreSQL Table Partitioning to manage their data loads. `OCPPMessages`
uses a one-week partition, while `Transactions` uses a one-month partitions. You can read more about the partitioning
[here](https://github.com/citrineos/citrineos-core/blob/main/apps/ocpp-server/README.md#table-partitioning).

## [CONFIGURATION] System Configuration is no longer persisted

Configurations for CitrineOS used to come from three places: 

1. The `SystemConfig` in src/config/envs/{local,docker}.ts (selected by APP_ENV)
2. A persisted `config.json` in file storage
3. `BOOTSTRAP_CITRINEOS_*` / `CITRINEOS_*` env vars

In 2.x configurations are now determined via non-persisted environment variables, represented by the Zod schema in 
`packages/types/src/config/types.ts`. Therefore, your old config.json settings will not be picked up; you will have 
to port them to environment variables manually. Additionally, websocket configurations were moved into their own file
called `websocket-servers.json`.

In general, this is how you migrate to the new environment variables if you already had an old environment:

1. Delete your persisted config.json. The Zod schema defaults are the old local-dev values.
2. Rename your environment variables. Use one underscore per level, not per word, drop the BOOTSTRAP_ prefix, and always 
   prefix with `CITRINEOS_`. For example, `timeouts.maxCallLengthSeconds` becomes `CITRINEOS_TIMEOUTS_MAXCALLLENGTHSECONDS`. 
   Unknown vars now log a warning at startup instead of silently doing nothing.
3. Move util.networkConnection.websocketServers into websocket-servers.json. The field names are the same, but
   the validation is stricter: id/host/port/protocols/securityProfile required, unique ids, exactly one of tenantId or 
   dynamicTenantResolution.
4. `util` and `modules` configs were flattened. Everything moves up a level and is keyed by what it configures, not 
   which module reads it (`modules.transactions.costUpdatedInterval` becomes `transactions.costUpdatedInterval`). 
   The three per-protocol boot blocks collapse into one shared ocpp block — so 1.6 and 2.0.1 chargers can no longer be 
   booted differently via config.
5. Per-module OCPP action lists, per-module host/port, modules.tenant.ocppRouterBaseUrl, and ocpiServer (OCPI is its own app)
   were all completely removed as configs.

For more information on the changes and help on migrating your configuration, you can check [here]
(https://github.com/citrineos/citrineos-core#migrating-from-the-old-configuration).

## [ROUTER] OCPP Router sends to Messages Module

This is not a breaking change if you haven't made changes to the OCPP Router. To offload some of the business logic out 
of the "hot path" of the router, a new module called "Messages" was created to handle such logic. You can read more about 
its purpose and architecture [here](https://github.com/citrineos/citrineos-core/blob/main/packages/ocpp/src/modules/messages/README.md).

## [API] Endpoint Paths

All Data APIs annotated with `@AsDataEndpoint` were moved into their own module `Api` and endpoints declared into their
own files, organized by protocol and module. You can find the new module in `packages/ocpp/src/apis`. If you rely on
specific API paths, see below:

/// details |  Data / Command Endpoints
    type: info

In 1.x, these were `@AsDataEndpoint` routes under `/data/<module>/<namespace>`. In 2.x, they're registered in `packages/ocpp/src/apis/register.ts` under `/commands`, `/ocpprouter`, `/permissions`, `/dev` or `/evdriver`.

| 1.x | 2.x | Status |
|---|---|---|
| `PUT /data/configuration/boot` | `PUT /commands/bootConfig` | Moved |
| `GET /data/configuration/boot` | `GET /commands/bootConfig` | Moved |
| `DELETE /data/configuration/boot` | `DELETE /commands/bootConfig` | Moved |
| `POST /data/configuration/password` | `POST /commands/setStationPassword` | Moved |
| `GET /data/configuration/serverNetworkProfile` | `GET /commands/stationNetworkProfile` | Moved |
| `DELETE /data/configuration/serverNetworkProfile` | `DELETE /commands/stationNetworkProfile` | Moved |
| `GET /data/evdriver/localListVersion` | `GET /commands/localListVersion` | Moved |
| `PUT /data/monitoring/variableAttribute` | `PUT /commands/provisionStationVariables` | Moved |
| `GET /data/monitoring/variableAttribute` | `GET /commands/stationVariables` | Moved |
| `DELETE /data/monitoring/variableAttribute` | `DELETE /commands/stationVariables` | Moved |
| `GET /data/transactions/transaction` | `GET /commands/transaction` | Moved |
| `PUT /data/transactions/tariff` | `PUT /commands/tariff` | Moved |
| `GET /data/transactions/tariff` | `GET /commands/tariff` | Moved |
| `DELETE /data/transactions/tariff` | `DELETE /commands/tariff` | Moved |
| `PUT /data/certificates/rootCertificate` | `PUT /commands/installRootCertificate` | Moved |
| `POST /data/certificates/uploadExistingCertificate` | `POST /commands/uploadExistingCertificate` | Moved |
| `POST /data/certificates/regenerateExistingCertificate` | `POST /commands/regenerateCertificate` | Moved |
| `POST /data/certificates/certificateChain` | `POST /ocpprouter/certificateChain` | Moved |
| `PUT /data/certificates/tlsCertificates` | — | **Removed** |
| `POST /data/ocpprouter/tlsReload` | `POST /ocpprouter/tlsReload` | Moved |
| `POST /data/ocpprouter/subscription` | `POST /ocpprouter/subscription` | Moved |
| `GET /data/ocpprouter/subscription` | `GET /ocpprouter/subscription` | Moved |
| `DELETE /data/ocpprouter/subscription` | `DELETE /ocpprouter/subscription` | Moved |
| `PUT /data/ocpprouter/websocketMapping` | `PUT /ocpprouter/websocketMapping` | Moved |
| `DELETE /data/ocpprouter/websocketMapping` | `DELETE /ocpprouter/websocketMapping` | Moved |
| `DELETE /data/ocpprouter/connection` | `DELETE /ocpprouter/connection` | Moved |
| `GET /data/ocpprouter/websocket` | — | **Removed** |
| `POST /data/ocpprouter/websocket` | — | **Removed** |
| `DELETE /data/ocpprouter/websocket` | — | **Removed** |
| — | `POST /evdriver/webpayment/initiate` | **New** |
| — | `GET /permissions/` | **New** |
| — | `GET /permissions/user` | **New** |
| — | `POST /dev/token` | **New** (only when `auth.mode = localDev`) |
| — | `GET /dev/roles` | **New** (only when `auth.mode = localDev`) |
///

/// details |  OCPP Message Endpoints
    type: info

These have the same pattern in both versions: `POST /ocpp/<version>/<module>/<action>`. In 1.x, they were `@AsMessageEndpoint` methods in each module's `MessageApi`. In 2.x, they're listed in `packages/ocpp/src/apis/ocpp/<version>/<module>.ts`.

`{2.0.1|2.1}` means the route is registered for both versions. In 2.x, a version gets the route only if that version has a request schema for the action.

| 1.x | 2.x | Status |
|---|---|---|
| `POST /ocpp/1.6/configuration/changeAvailability` | `POST /ocpp/1.6/configuration/changeAvailability` | Unchanged |
| `POST /ocpp/1.6/configuration/changeConfiguration` | `POST /ocpp/1.6/configuration/changeConfiguration` | Unchanged |
| `POST /ocpp/1.6/configuration/dataTransfer` | `POST /ocpp/1.6/configuration/dataTransfer` | Unchanged |
| `POST /ocpp/1.6/configuration/getConfiguration` | `POST /ocpp/1.6/configuration/getConfiguration` | Unchanged |
| `POST /ocpp/1.6/configuration/reset` | `POST /ocpp/1.6/configuration/reset` | Unchanged |
| `POST /ocpp/1.6/configuration/signedUpdateFirmware` | `POST /ocpp/1.6/configuration/signedUpdateFirmware` | Unchanged |
| `POST /ocpp/1.6/configuration/triggerMessage` | `POST /ocpp/1.6/configuration/triggerMessage` | Unchanged |
| `POST /ocpp/1.6/configuration/updateFirmware` | `POST /ocpp/1.6/configuration/updateFirmware` | Unchanged |
| `POST /ocpp/1.6/evdriver/clearCache` | `POST /ocpp/1.6/evdriver/clearCache` | Unchanged |
| — | `POST /ocpp/1.6/evdriver/getLocalListVersion` | **New** |
| `POST /ocpp/1.6/evdriver/remoteStartTransaction` | `POST /ocpp/1.6/evdriver/remoteStartTransaction` | Unchanged |
| `POST /ocpp/1.6/evdriver/remoteStopTransaction` | `POST /ocpp/1.6/evdriver/remoteStopTransaction` | Unchanged |
| — | `POST /ocpp/1.6/evdriver/sendLocalList` | **New** |
| `POST /ocpp/1.6/evdriver/unlockConnector` | `POST /ocpp/1.6/evdriver/unlockConnector` | Unchanged |
| `POST /ocpp/1.6/reporting/getDiagnostics` | `POST /ocpp/1.6/reporting/getDiagnostics` | Unchanged |
| `POST /ocpp/1.6/smartcharging/clearChargingProfile` | `POST /ocpp/1.6/smartcharging/clearChargingProfile` | Unchanged |
| `POST /ocpp/1.6/smartcharging/getCompositeSchedule` | `POST /ocpp/1.6/smartcharging/getCompositeSchedule` | Unchanged |
| `POST /ocpp/1.6/smartcharging/setChargingProfile` | `POST /ocpp/1.6/smartcharging/setChargingProfile` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/certificates/certificateSigned` | `POST /ocpp/{2.0.1\|2.1}/certificates/certificateSigned` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/certificates/deleteCertificate` | `POST /ocpp/{2.0.1\|2.1}/certificates/deleteCertificate` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/certificates/getInstalledCertificateIds` | `POST /ocpp/{2.0.1\|2.1}/certificates/getInstalledCertificateIds` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/certificates/installCertificate` | `POST /ocpp/{2.0.1\|2.1}/certificates/installCertificate` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/changeAvailability` | `POST /ocpp/{2.0.1\|2.1}/configuration/changeAvailability` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/clearDisplayMessage` | `POST /ocpp/{2.0.1\|2.1}/configuration/clearDisplayMessage` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/dataTransfer` | `POST /ocpp/{2.0.1\|2.1}/configuration/dataTransfer` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/getDisplayMessages` | `POST /ocpp/{2.0.1\|2.1}/configuration/getDisplayMessages` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/publishFirmware` | `POST /ocpp/{2.0.1\|2.1}/configuration/publishFirmware` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/reset` | `POST /ocpp/{2.0.1\|2.1}/configuration/reset` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/setDisplayMessage` | `POST /ocpp/{2.0.1\|2.1}/configuration/setDisplayMessage` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/setNetworkProfile` | `POST /ocpp/{2.0.1\|2.1}/configuration/setNetworkProfile` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/triggerMessage` | `POST /ocpp/{2.0.1\|2.1}/configuration/triggerMessage` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/unpublishFirmware` | `POST /ocpp/{2.0.1\|2.1}/configuration/unpublishFirmware` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/configuration/updateFirmware` | `POST /ocpp/{2.0.1\|2.1}/configuration/updateFirmware` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/cancelReservation` | `POST /ocpp/{2.0.1\|2.1}/evdriver/cancelReservation` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/clearCache` | `POST /ocpp/{2.0.1\|2.1}/evdriver/clearCache` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/getLocalListVersion` | `POST /ocpp/{2.0.1\|2.1}/evdriver/getLocalListVersion` | Unchanged |
| — | `POST /ocpp/2.1/evdriver/notifyWebPaymentStarted` | **New** |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/requestStartTransaction` | `POST /ocpp/{2.0.1\|2.1}/evdriver/requestStartTransaction` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/requestStopTransaction` | `POST /ocpp/{2.0.1\|2.1}/evdriver/requestStopTransaction` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/reserveNow` | `POST /ocpp/{2.0.1\|2.1}/evdriver/reserveNow` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/sendLocalList` | `POST /ocpp/{2.0.1\|2.1}/evdriver/sendLocalList` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/evdriver/unlockConnector` | `POST /ocpp/{2.0.1\|2.1}/evdriver/unlockConnector` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/clearVariableMonitoring` | `POST /ocpp/{2.0.1\|2.1}/monitoring/clearVariableMonitoring` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/getVariables` | `POST /ocpp/{2.0.1\|2.1}/monitoring/getVariables` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/setMonitoringBase` | `POST /ocpp/{2.0.1\|2.1}/monitoring/setMonitoringBase` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/setMonitoringLevel` | `POST /ocpp/{2.0.1\|2.1}/monitoring/setMonitoringLevel` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/setVariableMonitoring` | `POST /ocpp/{2.0.1\|2.1}/monitoring/setVariableMonitoring` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/monitoring/setVariables` | `POST /ocpp/{2.0.1\|2.1}/monitoring/setVariables` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/reporting/customerInformation` | `POST /ocpp/{2.0.1\|2.1}/reporting/customerInformation` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/reporting/getBaseReport` | `POST /ocpp/{2.0.1\|2.1}/reporting/getBaseReport` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/reporting/getLog` | `POST /ocpp/{2.0.1\|2.1}/reporting/getLog` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/reporting/getMonitoringReport` | `POST /ocpp/{2.0.1\|2.1}/reporting/getMonitoringReport` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/reporting/getReport` | `POST /ocpp/{2.0.1\|2.1}/reporting/getReport` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/smartcharging/clearChargingProfile` | `POST /ocpp/{2.0.1\|2.1}/smartcharging/clearChargingProfile` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/smartcharging/clearedChargingLimit` | — | **Removed** |
| `POST /ocpp/{2.0.1\|2.1}/smartcharging/getChargingProfiles` | `POST /ocpp/{2.0.1\|2.1}/smartcharging/getChargingProfiles` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/smartcharging/getCompositeSchedule` | `POST /ocpp/{2.0.1\|2.1}/smartcharging/getCompositeSchedule` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/smartcharging/setChargingProfile` | `POST /ocpp/{2.0.1\|2.1}/smartcharging/setChargingProfile` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/transactions/costUpdated` | `POST /ocpp/{2.0.1\|2.1}/transactions/costUpdated` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/transactions/getTransactionStatus` | `POST /ocpp/{2.0.1\|2.1}/transactions/getTransactionStatus` | Unchanged |
| `POST /ocpp/{2.0.1\|2.1}/transactions/setDefaultTariff` | `POST /ocpp/{2.0.1\|2.1}/transactions/setDefaultTariff` | Unchanged |
///

# PNPM

CitrineOS now uses `pnpm`, so any commands that you currently run should be prefixed with `pnpm`.

## Running CitrineOS

The command `pnpm citrine` was added to make it easier to run CitrineOS. You can check what flags are available using
``pnpm citrine --help``

# Dependency Injection (via Awilix)

To support testability and module organization, CitrineOS now uses `Awilix` for dependency injection.

# RabbitMQ Dead-Letter Queue

Dead-lettering was added to RabbitMQ. The exchange is called `<exchange>.dlx` while the queue is called `<exchange>.dlq`
with `x-citrineos-dead-letter-*` headers. See related configurations for RabbitMQ at `DATABASE` -> `schema`, `validateSchema`, and
`validateSchemaSeverity` in [configurations](../core-concepts/configuration)).

# Monorepo

The biggest change between 1.x and 2.x is that CitrineOS is now a monorepo containing the following modules:

1. Core (OCPP)
2. OCPI
3. Operator UI

## Folder Structure

    1.x                                    2.x
    -------------------------------        -------------------------------
    |-- 00_Base/                           |-- packages/
    |-- 01_Data/                           |   |-- base/                [NEW] 00_Base
    |-- 02_Util/                           |   |-- dal/                 [NEW] 01_Data, data access layer
    |-- 03_Modules/                        |   |-- ocpi/                [NEW] previously in citrineos-ocpi
    |-- Server/                            |   |-- ocpp/                [NEW] combination of 02_Util and 03_Modules
    |-- migrations/                        |   |-- types/               [NEW] split out of base
    |-- db.sync.ts                         |-- apps/
    |-- db.force-sync.ts                   |   |-- mock-msp/            [NEW]
    |-- entrypoint.sh                      |   |-- ocpi-server/         [NEW] previously in citrineos-ocpi
    |-- .sequelizerc                       |   |-- ocpp-server/         [NEW] previously Server
    |-- package-lock.json                  |   |-- operator-ui/         [NEW] previously in citrineos-operator-ui
                                           |-- scripts/                 [NEW]
                                           |-- docker-compose.yml       [NEW]
                                           |-- docker-compose.local.yml [NEW]
                                           |-- pnpm-workspace.yaml      
                                           |-- pnpm-lock.yaml


### DAL
Data access layer-related classes (such as Sequelize repository and models) were moved to a standalone package `dal`
so the data access layer can be imported without pulling in `base` or `core`.

#### Drizzle

CitrineOS is migrating away from Sequelize towards Drizzle. This work is ongoing and will not be completed by
the release of version 2.0.0, so you can track the progress in `packages/dal/src/repositories/drizzle`, and the table 
schemas are in `packages/dal/src/db/drizzle`. If you want to try the already-migrated repositories, you can enable it by 
setting `CITRINEOS_USE_DRIZZLE` to "true".

#### Schema Validation

In order to align the data models with the database entities, a new schema validator was introduced to run prior to
CitrineOS starting to ensure that the shapes in the code and database match each other. There is a validator for 
Sequelize and Drizzle, though once Drizzle is fully in use, the Sequelize validator will go away.

You can configure how the schema validation runs using configurations (see `DATABASE` -> `schema`, `validateSchema`, and 
`validateSchemaSeverity` in [configurations](../core-concepts/configuration)).

### Types

OCPP message models were moved to a standalone package `types` so consumers can depend on the schemas without pulling in `base`.

### OCPI

OCPI-related modules, handlers, APIs and transports were all moved to the dedicated `ocpi` folder. It should no longer
rely on the `ocpp` folder and instead uses the `base`, `dal` , and `types` dependencies for whatever it shares with
the other modules. The package.json package name for `ocpi-server` has been updated to be `ocpi-server`.

### Handlers

All module handlers decorated with `@AsHandler` were moved out of their respective `module.ts` files and separated into
their own handlers decorated with `@AsRequestHandler` or `@AsResponseHandler`, organized by protocol and request/response
type. You can find the handlers in `packages/ocpp/src/handlers`.

## Filenames in Kebab Case

Any filenames that were created and not necessary for a library's config were renamed to be in kebab case. This means
filenames-now-look-like-this.