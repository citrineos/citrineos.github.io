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

You can find an example of how to craft the necessary SQL in the migration file `apps/ocpp-server/migrations/20260427000000-rename-charging-station-columns.ts`.

Note that if you are on version 1.9.x, you can follow the example of the migration above, as it runs against the
`stationPkId` column. If you are on a version prior to 1.9.x, the column to migrate will be `stationId`.

## [DATABASE] Additional OCPPMessage Columns

This is not a breaking change if you're not reliant on a particular OCPPMessage structure. OCPPMessage deprecated the
`state` and `message` columns in favor of `type`, `payload`, and `raw`. `state` was replaced by `type` because the latter
stores the actual OCPP Message Type. `message` was replaced by `payload` (the parsed payload) and `raw` (the raw OCPP
message received).

## [CONFIGURATION] System Configuration Is No Longer Persisted

Configurations for CitrineOS used to come from three places: 

1. the `SystemConfig` in src/config/envs/{local,docker}.ts (selected by APP_ENV)
2. A persisted config.json in file storage
3. BOOTSTRAP_CITRINEOS_* / CITRINEOS_* env vars

In 2.x configurations are now determined via non-persisted environment variables, represented by the Zod schema over
in `packages/types/src/config/types.ts`. Therefore, your old config.json settings will not be picked up; you will have 
to port them to environment variables manually. Additionally, websocket configurations were moved into their own file
called `websocket-servers.json`.

In general, this is how you migrate to the new environment variables if you already had an old environment:

1. Delete your persisted config.json. The Zod schema defaults are the old local-dev values.
2. Rename your environment variables. Use one underscore per level, not per word, drop the BOOTSTRAP_ prefix, and always 
   prefix with CITRINEOS_. For example, `timeouts.maxCallLengthSeconds` becomes `CITRINEOS_TIMEOUTS_MAXCALLLENGTHSECONDS`. 
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

For more information on the changes and how to migrate, go over to the main repository: https://github.com/citrineos/citrineos-core#migrating-from-the-old-configuration

# Monorepo

The biggest change between 1.x and 2.x is that CitrineOS is now a monorepo containing the following modules:

1. Core (OCPP)
2. OCPI
3Operator UI

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

### Types

OCPP message models were moved to a standalone package `types` so consumers can depend on the schemas without pulling in `base`.

### DAL
Data access layer-related classes (such as Sequelize repository and models) were moved to a standalone package `dal`
so the data access layer can be imported without pulling in `base` or `core`.

#### Drizzle

CitrineOS is migrating away from Sequelize towards Drizzle. This work is ongoing and will not be completed by
the release of version 2.0.0, so you can track the progress in `packages/ocpp/src/dal/layers/drizzle`. If you want
to try the already-migrated repositories, you can enable it by setting `CITRINEOS_USE_DRIZZLE` to "true".

### Handlers

All module handlers decorated with `@AsHandler` were moved out of their respective `module.ts` files and separated into
their own handlers decorated with `@AsRequestHandler` or `@AsResponseHandler`, organized by protocol and request/response
type. You can find the handlers in `packages/ocpp/src/handlers`.

### APIs

All Data APIs annotated with `@AsDataEndpoint` were moved into their own module `Api` and endpoints declared into their
own files, organized by protocol and module. You can find the new module in `packages/ocpp/src/apis`.

## Filenames in Kebab Case

Any filenames that were created and not necessary for a library's config were renamed to be in kebab case. This means
filenames-now-look-like-this.

# PNPM

CitrineOS now uses `pnpm`, so any commands that you currently run should be prefixed with `pnpm`.

## Running CitrineOS

The command `pnpm citrine` was added to make it easier to run CitrineOS. You can check what flags are available using 
``pnpm citrine --help``

# Dependency Injection (via Awilix)

To support testability and module organization, CitrineOS now uses `Awilix` for dependency injection.