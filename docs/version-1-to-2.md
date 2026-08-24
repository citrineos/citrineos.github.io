---
title: CitrineOS 1.x to 2.x
---

/// admonition | Prior to upgrading to version 2.x, if you have existing data, do not run the Sequelize migrations as they may cause data loss.
    type: warning

You can turn off the migrations by updating `apps/ocpp-server/entrypoint.sh` to not run `db:migrate`.
///

# Monorepo

The biggest change between 1.x and 2.x is that CitrineOS is now a monorepo containing the following modules:

1. Core (OCPP)
2. Operator UI
3. OCPI

## Folder Structure

    1.x                                    2.x
    -------------------------------        -------------------------------
    |-- base/          <- library          |-- packages/
    |-- core/          <- library          |   |-- types/               [NEW] split out of base
    |-- Server/        <- app              |   |-- base/
    |-- migrations/                        |   |-- core/
    |-- db.sync.ts                         |   |-- ocpi-base/           [NEW]
    |-- db.force-sync.ts                   |-- apps/
    |-- entrypoint.sh                      |   |-- ocpp-server/         <- was Server/
    |-- .sequelizerc                       |   |-- ocpi-server/         [NEW]
    |-- package-lock.json                  |   |-- operator-ui/         [NEW]
                                           |   |-- mock-msp/            [NEW]
                                           |-- scripts/                 [NEW]
                                           |-- docker-compose.yml       [NEW]
                                           |-- docker-compose.local.yml [NEW]
                                           |-- pnpm-workspace.yaml      [NEW]
                                           |-- pnpm-lock.yaml

## 1.x Code to 2.x Code

| 1.x path | 2.x path | note                                                                   |
|---|---|------------------------------------------------------------------------|
| `base/` | `packages/base/` | runtime interfaces, config, money, rpc                                 |
| `base/src/ocpp/model/**` | `packages/types/src/ocpp/model/**` | 1.6 / 2.0.1 / 2.1 schemas + enums + types split into their own package |
| `base/src/interfaces/dto/` | `packages/types/src/interfaces/dto/` |                                                                        |
| `core/` | `packages/core/` |                                                                        |
| `Server/` | `apps/ocpp-server/` | the OCPP server became one app among several                           |
| `migrations/` | `apps/ocpp-server/migrations/` | moved next to the app that owns them                                   |
| `db.sync.ts`, `db.force-sync.ts` | — | root-level DB sync scripts removed                                     |
| `.husky/` | — | pre-commit hook removed                                                |


# Breaking Database Changes

## Station ID -> OCPP Connection Name

Charging Station "human-readable" identifiers are now stored in the `ocppConnectionName` column, while the `id` column 
became the dedicated database serial integer identifier. As a result, every related entity to Charging Stations had to 
be updated so that their `stationId` references the Charging Station's `id` integer column, rather than the 
`ocppConnectionName` string column. All related indexes were also updated to reflect this change.

If you have skipped the migration due to existing data, as warned above, you will need to ensure that all tables 
referencing `stationId` as the Charging Station's string value `ocppConnectionName` are updated to reference the proper
Charging Station `id` serial integer column.

You can find an example of how to craft the necessary SQL in the migration file `20260427000000-rename-charging-station-columns.ts`
which lives in `apps/ocpp-server/migrations/20260427000000-rename-charging-station-columns.ts`.

Note that if you are on version 1.9.x, you can follow the example of the migration above, as it runs against the 
`stationPkId` column. If you are on a version prior to 1.9.x, the column to migrate will be `stationId`. 

## Additional OCPPMessage Columns

This is not a breaking change if you're not reliant on a particular OCPPMessage structure. OCPPMessage deprecated the
`state` and `message` columns in favor of `type`, `payload`, and `raw`. `state` was replaced by `type` because the latter
stores the actual OCPP Message Type. `message` was replaced by `payload` (the parsed payload) and `raw` (the raw OCPP 
message received).

# PNPM

CitrineOS now uses `pnpm`, so any commands that you currently run should be prefixed with `pnpm`.

## Running CitrineOS

The command `pnpm citrine` was added to make it easier to run CitrineOS. You can check what flags are available using 
``pnpm citrine --help``

# Dependency Injection (via Awilix)

To support testability and module organization, CitrineOS now uses `Awilix` for dependency injection.

# Types

OCPP message models were moved to a standalone package `types` so consumers can depend on the schemas without pulling in `base`.

# Handlers

All module handlers decorated with `@AsHandler` were moved out of their respective `module.ts` files and separated into
their own handlers decorated with `@AsRequestHandler` or `@AsResponseHandler`, organized by protocol and request/response
type. You can find the handlers in `packages/core/src/handlers`.

# APIs

All Data APIs annotated with `@AsDataEndpoint` were moved into their own module `Api` and endpoints declared into their
own files, organized by protocol and module. You can find the new module in `packages/core/modules/Api`.

# Drizzle

CitrineOS is migrating away from Sequelize towards Drizzle. This work is ongoing and will not be completed by
the release of version 2.0.0, so you can track the progress in `packages/core/src/dal/layers/drizzle`. If you want
to try the already-migrated repositories, you can enable `CITRINEOS_USE_DRIZZLE`.