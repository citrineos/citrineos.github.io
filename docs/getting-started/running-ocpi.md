---
layout: doc
title: Running OCPI
---

/// admonition | Before continuing, set up the necessary [prerequisites](prerequisites.md) and [get CitrineOS running](running-citrineos.md).
    type: warning
///

# Running with Docker

In the repository root, you can execute one of the following commands to spin up a complete CitrineOS environment in Docker:

    pnpm citrine --ocpi            # ocpp-server + operator UI + ocpi-server from published ghcr.io images
    pnpm citrine --local --ocpi    # ocpp-server + operator UI + ocpi-server from local source instead of pulling

Once running, OCPI is accessible at [localhost:8085](http://localhost:8085) with Swagger UI docs available at [localhost:8085/docs](http://localhost:8085/docs).

## Stopping Docker

If you want to take down the containers:

    pnpm citrine down --ocpi      # stop the stack (pass the same flags you started it with)

# Setting up a Tenant Partner

CitrineOS OCPP and OCPI will see each other via a Tenant Partner, which you can set up via the Operator UI or via the 
sample GraphQL below (ensure CitrineOS is running):

    mutation UpsertDefaultTenantPartner() {
      insert_TenantPartners_one(
        object: {
          id: 1
          tenantId: 1
          partyId: "TST"
          countryCode: "US"
          createdAt: "2026-08-07T17:55:00+00:00"
          updatedAt: "2026-09-21T00:00:00.000Z"
          partnerProfileOCPI: {
            "roles": [
              {
                "role": "EMSP",
                "businessDetails": {
                  "logo": {
                    "url": "https://www.test-mobility.com/assets/brand/logo.svg",
                    "type": "svg",
                    "width": 150,
                    "height": 60,
                    "category": "OPERATOR"
                  },
                  "name": "TestMobilitySolutions",
                  "website": "https://www.test-mobility.com"
                }
              }
            ],
            "version": {
              "version": "2.2.1",
              "versionDetailsUrl": "http://host.docker.internal:8083/ocpi/versions/2.2.1"
            },
            "endpoints": [
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/credentials", "identifier": "credentials" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/locations", "identifier": "locations_RECEIVER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/tariffs", "identifier": "tariffs_RECEIVER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/sessions", "identifier": "sessions_RECEIVER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/cdrs", "identifier": "cdrs_RECEIVER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/tokens", "identifier": "tokens_SENDER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/commands", "identifier": "commands_SENDER" },
              { "url": "http://host.docker.internal:8083/ocpi/2.2.1/emsp/chargingprofiles", "identifier": "chargingprofiles_RECEIVER" }
            ],
            "credentials": {
              "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
              "versionsUrl": "https://our-server.citrineos.com/ocpi/versions"
            },
            "serverCredentials": {
              "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9eyJzdWIiOiJwYXJ0bmVyIn0",
              "versionsUrl": "http://host.docker.internal:8083/ocpi/versions"
            }
          }
        }
        on_conflict: {
          constraint: TenantPartners_pkey
          update_columns: [tenantId, partyId, countryCode, partnerProfileOCPI, updatedAt]
        }
      ) {
        id 
        tenantId 
        partyId 
        countryCode 
        createdAt 
        updatedAt 
        partnerProfileOCPI
      }
    }


# Configuration

| Config path | Type | Env var (as coded) | local.ts | docker.ts | Req. |
|---|---|---|---|---|---|
| `env` | `'development' \| 'production'` | — | `development` | `development` | ✅ |
| `ocpiServer.host` | string | — | `0.0.0.0` | `0.0.0.0` | opt |
| `ocpiServer.port` | int > 0 | — | `8085` | `8085` | opt |
| `ocpiModules.credentials.endpointPrefix` | string | — | `/credentials` | `/credentials` | opt |
| `ocpiModules.versions.endpointPrefix` | string | — | `/versions` | `/versions` | opt |
| `ocpiModules.locations.endpointPrefix` | string | — | `/locations` | `/locations` | opt |
| `ocpiModules.sessions.endpointPrefix` | string | — | `/sessions` | `/sessions` | opt |
| `ocpiModules.cdrs.endpointPrefix` | string | — | `/cdrs` | `/cdrs` | opt |
| `ocpiModules.tokens.endpointPrefix` | string | — | `/tokens` | `/tokens` | opt |
| `ocpiModules.tariffs.endpointPrefix` | string | — | `/tariffs` | `/tariffs` | opt |
| `ocpiModules.chargingProfiles.endpointPrefix` | string | — | `/chargingprofiles` | `/chargingprofiles` | opt |
| `ocpiModules.commands.endpointPrefix` | string | — | `/commands` | `/commands` | opt |
| `database.host` | string | `DB_HOST` | `localhost` | `postgres` | opt |
| `database.port` | int > 0 | `DB_PORT` | `5432` | `5432` | opt |
| `database.database` | string | `DB_NAME` | `citrine` | `citrine` | opt |
| `database.username` | string | `DB_USER` | `citrine` | `citrine` | opt |
| `database.password` | string | `DB_PASS` | `citrine` | `citrine` | opt |
| `cache.memory` | boolean | — | `true` | `true` if no `REDIS_HOST` | ⚠️ one of |
| `cache.redis.host` | string | `REDIS_HOST` | — | set if present | ⚠️ one of |
| `cache.redis.port` | int > 0 | `REDIS_PORT` | — | `6379` | opt |
| `graphql.endpoint` | string | `GRAPHQL_ENDPOINT` | `http://localhost:8090/v1/graphql` | `http://graphql-engine:8080/v1/graphql` | ✅ |
| `graphql.headers` | `Record<string,string>` | — | *unused* | *unused* | opt |
| `commands.timeout` | int > 0 (sec) | `COMMANDS_TIMEOUT` | `30` | `30` | opt |
| `commands.ocpiBaseUrl` | string | `COMMANDS_OCPI_BASE_URL` | `http://localhost:8085/ocpi` | `http://citrineos-ocpi:8085/ocpi` | opt |
| `commands.coreHeaders` | `Record<string,string>` (JSON) | `COMMANDS_CORE_HEADERS` | `{}` | `{}` | opt |
| `commands.ocpp1_6.remoteStartTransactionRequestUrl` | string | `COMMANDS_OCPP1_6_REMOTE_START_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/1.6/evdriver/remoteStartTransaction` | `http://citrine:8080/ocpp/1.6/evdriver/remoteStartTransaction` | ✅ |
| `commands.ocpp1_6.remoteStopTransactionRequestUrl` | string | `COMMANDS_OCPP1_6_REMOTE_STOP_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/1.6/evdriver/remoteStopTransaction` | `http://citrine:8080/ocpp/1.6/evdriver/remoteStopTransaction` | ✅ |
| `commands.ocpp1_6.unlockConnectorRequestUrl` | string | `COMMANDS_OCPP1_6_UNLOCK_CONNECTOR_REQUEST_URL` | `http://localhost:8080/ocpp/1.6/evdriver/unlockConnector` | `http://citrine:8080/ocpp/1.6/evdriver/unlockConnector` | ✅ |
| `commands.ocpp2_0_1.requestStartTransactionRequestUrl` | string | `COMMANDS_OCPP2_0_1_REQUEST_START_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/2.0.1/evdriver/requestStartTransaction` | `http://citrine:8080/ocpp/2.0.1/evdriver/requestStartTransaction` | ✅ |
| `commands.ocpp2_0_1.requestStopTransactionRequestUrl` | string | `COMMANDS_OCPP2_0_1_REQUEST_STOP_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/2.0.1/evdriver/requestStopTransaction` | `http://citrine:8080/ocpp/2.0.1/evdriver/requestStopTransaction` | ✅ |
| `commands.ocpp2_0_1.unlockConnectorRequestUrl` | string | `COMMANDS_OCPP2_0_1_UNLOCK_CONNECTOR_REQUEST_URL` | `http://localhost:8080/ocpp/2.0.1/evdriver/unlockConnector` | `http://citrine:8080/ocpp/2.0.1/evdriver/unlockConnector` | ✅ |
| `commands.ocpp2_1.requestStartTransactionRequestUrl` | string | `COMMANDS_OCPP2_1_REQUEST_START_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/2.1/evdriver/requestStartTransaction` | `http://citrine:8080/ocpp/2.1/evdriver/requestStartTransaction` | ✅ |
| `commands.ocpp2_1.requestStopTransactionRequestUrl` | string | `COMMANDS_OCPP2_1_REQUEST_STOP_TRANSACTION_REQUEST_URL` | `http://localhost:8080/ocpp/2.1/evdriver/requestStopTransaction` | `http://citrine:8080/ocpp/2.1/evdriver/requestStopTransaction` | ✅ |
| `commands.ocpp2_1.unlockConnectorRequestUrl` | string | `COMMANDS_OCPP2_1_UNLOCK_CONNECTOR_REQUEST_URL` | `http://localhost:8080/ocpp/2.1/evdriver/unlockConnector` | `http://citrine:8080/ocpp/2.1/evdriver/unlockConnector` | ✅ |
| `messageBroker.amqp.url` | string | `AMQP_URL` | `amqp://guest:guest@localhost:5672` | `amqp://guest:guest@rabbitmq:5672` | opt |
| `messageBroker.amqp.exchange` | string | `AMQP_EXCHANGE` | `ocpi` | `ocpi` | opt |
| `messageBroker.kafka.brokers` | string[] | — | *unused* | *unused* | opt |
| `messageBroker.kafka.topicPrefix` | string | — | *unused* | *unused* | opt |
| `messageBroker.kafka.topicName` | string | — | *unused* | *unused* | opt |
| `messageBroker.kafka.sasl` | `{mechanism, username, password}` | — | *unused* | *unused* | opt |
| `swagger.path` | string | — | *unused* (`/docs`) | *unused* | opt |
| `swagger.logoPath` | string | — | *unused* | *unused* | ✅ if `swagger` set |
| `swagger.exposeData` | boolean | — | *unused* (`true`) | *unused* | opt |
| `swagger.exposeMessage` | boolean | — | *unused* (`true`) | *unused* | opt |
| `oidc.jwksUri` | string | — | *unused* | *unused* | ✅ if `oidc` set |
| `oidc.issuer` | string | — | *unused* | *unused* | ✅ if `oidc` set |
| `oidc.audience` | string | — | *unused* | *unused* | opt |
| `oidc.cacheTime` | number | — | *unused* | *unused* | opt |
| `oidc.rateLimit` | boolean | — | *unused* | *unused* | opt |
| `logLevel` | number 0–6 | `LOG_LEVEL` | `2` | `2` | opt |
| `logRedaction.keys` | string[] | — | *unused* (`['password']`) | *unused* | opt |
| `logRedaction.paths` | string[] | — | *unused* (`[]`) | *unused* | opt |
| `logRedaction.patterns` | string[] (regex) | — | *unused* (`[]`) | *unused* | opt |
| `logRedaction.placeholder` | string | — | *unused* (`[***]`) | *unused* | opt |
| `logRedaction.redactKeyCodes` | boolean | — | *unused* (`true`) | *unused* | opt |
| `defaultPageLimit` | int > 0 | `DEFAULT_PAGE_LIMIT` (docker only) | `50` hardcoded | `50` | opt |
| `maxPageLimit` | int > 0 | `MAX_PAGE_LIMIT` (docker only) | `1000` hardcoded | `1000` | opt |
