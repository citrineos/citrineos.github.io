---
title: Configuration
---

# Introduction
CitrineOS uses environment variables represented by the Zod schema in `packages/types/src/config/types.ts`
to define its behavior. This document describes the structure of this object, how to access and modify it, and 
provides low-level details about each available configuration.

## Scope
The configuration object controls the information needed for the specific technologies that fill a role in the application (
database, queue, cache, etc.) as well as optional OCPP features and certain values which can be different from network 
to network (heartbeat interval, message timeout, etc.).

# Websocket Servers

Setting up websocket servers doesn't happen from environment variables, but rather through the `websocket-servers.json`
file. You may change what file CitrineOS reads websocket servers from by setting `CITRINEOS_WEBSOCKETSERVERCONFIGFILE`.

## Websocket Server Configurations

| Field | Type | Required | Default | What it does                                                                                                                                                                                                            |
| --- | --- | --- | --- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `id` | string | Yes | — | Identifies this server. Must be unique across the array; used as the key for the server's certificate manager and stored on the `ServerNetworkProfile` row.                                                             |
| `host` | string | Yes | — | Bind address for this websocket listener.                                                                                                                                                                               |
| `port` | integer >= 1 | Yes | — | Port for this listener. Each entry is its own HTTP/HTTPS server, so ports must not collide.                                                                                                                             |
| `protocols` | array of `ocpp1.6` / `ocpp2.0.1` / `ocpp2.1` | Yes | — | The OCPP subprotocols this listener will negotiate. A station offering none of them is rejected at upgrade.                                                                                                             |
| `securityProfile` | integer 0–3 | Yes | — | OCPP security profile. 0 = plain ws, no auth; 1 = ws + HTTP Basic; 2 = TLS + Basic; 3 = mTLS (client cert). Drives whether an `http` or `https` server is created, and whether client certs are requested and verified. |
| `tenantId` | positive integer | One of | — | Pins the whole listener to a single tenant. Mutually exclusive with `dynamicTenantResolution` — exactly one must be set.                                                                                                |
| `dynamicTenantResolution` | boolean | One of | `false` | Resolves the tenant per connection from the request path segment, matched against `Tenant.tenantWebsocketServerPath`, instead of pinning one tenant to the listener.                                                    |
| `pingInterval` | integer >= 1 | No | `60` | Seconds between websocket pings (jitter applied on the first). Also sets the connection's cache TTL at `pingInterval × 3`, so it doubles as the liveness timeout.                                                       |
| `allowUnknownChargingStations` | boolean | No | `false` | Lets a station with no matching DB row connect and be provisioned ad hoc. Development and testing only — **do not use in production!!**                                                                                 |
| `ignoreAuthenticationHeaders` | boolean | No | `false` | Skips the HTTP Basic auth filter that security profiles 1 and 2 would otherwise enforce. An escape hatch for stations that cannot send credentials; it removes the authentication the profile implies.                  |
| `forceProtocol` | `ocpp1.6` / `ocpp2.0.1` / `ocpp2.1` | No | — | Pins negotiation to one version instead of picking from the station's offered list. If the station or this server does not support it, the upgrade fails with an explicit error.                                        |
| `tlsKeyFilePath` | string | Profiles 2, 3 | — | Server private key.                                                                                                                                                                                                     |
| `tlsCertificateChainFilePath` | string | Profiles 2, 3 | — | Server certificate chain, served via SNI for any profile above 1.                                                                                                                                                       |
| `mtlsCertificateAuthorityKeyFilePath` | string | Profile 3 | — | CA key for mTLS client-certificate handling.                                                                                                                                                                            |
| `rootCACertificateFilePath` | string | No | — | Root CA used as the TLS `ca` bundle to verify client certificates. Only read when `securityProfile > 2`.                                                                                                                |

# Environment Variables

You won't need to set anything if you are happy with the default values found in the Zod schema `packages/types/src/config/types.ts`.
Otherwise, follow the sections below to learn how to set the values you need.

## Setting values

To set an environment variable, prefix it with CITRINEOS_ and append the path to the field, uppercased, with one 
underscore per level, not per word. A camelCase field name stays one segment:

    logLevel                        →  CITRINEOS_LOGLEVEL
    database.host                   →  CITRINEOS_DATABASE_HOST
    timeouts.maxCallLengthSeconds   →  CITRINEOS_TIMEOUTS_MAXCALLLENGTHSECONDS
    fileAccess.local.defaultFilePath →  CITRINEOS_FILEACCESS_LOCAL_DEFAULTFILEPATH

Matching is case-insensitive. Values are parsed as JSON when possible and used as a raw string otherwise, so numbers and 
booleans need no special handling, and an empty object switches a whole optional block on with its defaults:

    CITRINEOS_LOGLEVEL: '1'
    CITRINEOS_OCPP_AUTOACCEPT: 'false'
    CITRINEOS_INTEGRATIONS_V2GCA: '{}' # opt in to the Hubject test PKI

## Top level

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_ENV` | `development` \| `production` | `development` | Runtime mode; affects log formatting. |
| `CITRINEOS_HOST` | string | `0.0.0.0` | HTTP bind address for the server. |
| `CITRINEOS_PORT` | integer > 0 | `8080` | HTTP port for the server. |
| `CITRINEOS_LOGLEVEL` | integer 0–6 | `2` | Log verbosity; `2` is debug. |
| `CITRINEOS_WEBSOCKETSERVERCONFIGFILE` | string | `websocket-servers.json` | Path (relative to the `fileAccess` root) of the JSON file listing the websocket servers this instance hosts. |

## `DATABASE`

The `DATABASE` block is optional — every field has a default, so an unset database still resolves to a local Postgres.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_DATABASE_HOST` | string | `localhost` | Database host. |
| `CITRINEOS_DATABASE_PORT` | integer > 0 | `5432` | Database port. |
| `CITRINEOS_DATABASE_DATABASE` | string | `citrine` | Database name. Note the doubled segment — the field is `database.database`. |
| `CITRINEOS_DATABASE_DIALECT` | string | `postgres` | Sequelize dialect. |
| `CITRINEOS_DATABASE_USERNAME` | string | `citrine` | Database user. |
| `CITRINEOS_DATABASE_PASSWORD` | string | `citrine` | Database password. |
| `CITRINEOS_DATABASE_SYNC` | boolean | `false` | Sync models to the schema on boot. |
| `CITRINEOS_DATABASE_ALTER` | boolean | `false` | Alter existing tables to match models when syncing. |
| `CITRINEOS_DATABASE_FORCE` | boolean | `false` | Drop and recreate tables when syncing. Destructive. |
| `CITRINEOS_DATABASE_MAXRETRIES` | integer > 0 | `3` | Connection attempts before giving up at startup. |
| `CITRINEOS_DATABASE_RETRYDELAY` | integer > 0 | `1000` | Milliseconds between connection attempts. |

### `DATABASE_POOL` — optional

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_DATABASE_POOL_MAX` | integer > 0 | unset | Maximum pooled connections. |
| `CITRINEOS_DATABASE_POOL_MIN` | integer >= 0 | unset | Minimum pooled connections held open. |
| `CITRINEOS_DATABASE_POOL_ACQUIRE` | integer > 0 | unset | Milliseconds to wait for a connection before erroring. |
| `CITRINEOS_DATABASE_POOL_IDLE` | integer > 0 | unset | Milliseconds a connection may sit idle before release. |

### `DATABASE_SSL` — optional

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_DATABASE_SSL_REQUIRE` | boolean | unset | Require a TLS connection to the database. |
| `CITRINEOS_DATABASE_SSL_REJECTUNAUTHORIZED` | boolean | unset | Verify the server certificate. Set `false` only for self-signed setups. |
| `CITRINEOS_DATABASE_SSL_CA` | string | unset | CA certificate used to verify the database server. |

## `CACHE`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_CACHE_TYPE` | `memory` \| `redis` | `memory` | Cache backend. `memory` is per-process, so multi-instance deployments want `redis`. |
| `CITRINEOS_CACHE_URL` | string | — | Required when type is `redis`. Must start with `redis://` or `rediss://`. |

## `MESSAGEBROKER_AMQP`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_MESSAGEBROKER_AMQP_URL` | string | `amqp://guest:guest@localhost:5672` | AMQP connection URL. |
| `CITRINEOS_MESSAGEBROKER_AMQP_EXCHANGE` | string | `citrineos` | Exchange modules publish to and subscribe from. |
| `CITRINEOS_MESSAGEBROKER_AMQP_INSTANCEIDENTIFIER` | string | unset | Identifies this instance on the broker; useful when several instances share an exchange. |
| `CITRINEOS_MESSAGEBROKER_AMQP_MAXRECONNECTDELAYSECONDS` | integer >= 1 | `30` | Ceiling on the reconnect backoff. |

## `FILEACCESS`

Storage the server reads its runtime files through — the websocket servers file, TLS material, the ACME account key, RBAC rules. 

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_FILEACCESS_TYPE` | `local` \| `s3` \| `gcp` | `local` | Selects the storage backend. |

### When `FILEACCESS_TYPE` is `local`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_FILEACCESS_LOCAL_DEFAULTFILEPATH` | string | `src/assets` from the block default (`data` if you set `local` yourself without it) | Root directory, resolved from the **process working directory** — which differs between pnpm (`apps/ocpp-server`) and Docker (repo root). |

### When `FILEACCESS_TYPE` is `s3`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_FILEACCESS_S3_REGION` | string | unset | AWS region. |
| `CITRINEOS_FILEACCESS_S3_ENDPOINT` | string | unset | Custom endpoint URL, e.g. for MinIO. |
| `CITRINEOS_FILEACCESS_S3_DEFAULTBUCKETNAME` | string | `citrineos-s3-bucket` | Bucket used when a key carries no bucket of its own. |
| `CITRINEOS_FILEACCESS_S3_S3FORCEPATHSTYLE` | boolean | `true` | Path-style addressing, required by MinIO and most S3-compatible servers. |
| `CITRINEOS_FILEACCESS_S3_ACCESSKEYID` | string | unset | Access key. The AWS SDK's own `AWS_*` variables also work. |
| `CITRINEOS_FILEACCESS_S3_SECRETACCESSKEY` | string | unset | Secret key. |

### When `FILEACCESS_TYPE` is `gcp`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_FILEACCESS_GCP_PROJECTID` | string | — | Required. GCP project ID. |
| `CITRINEOS_FILEACCESS_GCP_DEFAULTBUCKETNAME` | string | `citrineos-s3-bucket` | Bucket name. |
| `CITRINEOS_FILEACCESS_GCP_CREDENTIALS` | JSON object | unset | Service account credentials inline. If unset, Application Default Credentials are used. |

## `AUTH`

Guards the HTTP API. At least one of `oidc` or `localBypass` must be active; the block defaults to `localBypass: true` for local development.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_AUTH_LOCALBYPASS` | boolean | `true` (from the block default) | Skips authentication entirely. Development only. |
| `CITRINEOS_AUTH_OIDC_JWKSURI` | string | — | Required within the `oidc` block. Where the signing keys are fetched from. |
| `CITRINEOS_AUTH_OIDC_ISSUER` | string | — | Required. Expected `iss` claim. |
| `CITRINEOS_AUTH_OIDC_AUDIENCE` | string | — | Required. Expected `aud` claim. |
| `CITRINEOS_AUTH_OIDC_CACHETIMESECONDS` | integer >= 1 | unset | How long fetched JWKS keys are cached. |
| `CITRINEOS_AUTH_OIDC_RATELIMIT` | boolean | `true` | Rate-limits JWKS fetches. |

## `OIDCCLIENT` — optional

Credentials the server uses as an OIDC *client* when calling out. All four are required if the block is set.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_OIDCCLIENT_TOKENURL` | string | — | Token endpoint. |
| `CITRINEOS_OIDCCLIENT_CLIENTID` | string | — | Client ID. |
| `CITRINEOS_OIDCCLIENT_CLIENTSECRET` | string | — | Client secret. |
| `CITRINEOS_OIDCCLIENT_AUDIENCE` | string | — | Audience requested in the token. |

## `INTEGRATIONS`

Both CAs are opt-in and off by default, but zero-config once enabled — `'{}'` is enough to accept every default.

### `INTEGRATIONS_V2GCA`

For Plug & Charge PKI.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_INTEGRATIONS_V2GCA` | JSON object | unset | Set to `'{}'` to enable with the Hubject test PKI. |
| `CITRINEOS_INTEGRATIONS_V2GCA_NAME` | `hubject` | `hubject` | Provider. Hubject is the only implementation. |
| `CITRINEOS_INTEGRATIONS_V2GCA_HUBJECT_BASEURL` | string | Hubject test base URL | API base URL. |
| `CITRINEOS_INTEGRATIONS_V2GCA_HUBJECT_TOKENURL` | string | Hubject test token URL | Where the bearer token is obtained. |
| `CITRINEOS_INTEGRATIONS_V2GCA_HUBJECT_CLIENTID` | string | `YOUR_CLIENT_ID` | Client ID — the default is a placeholder, so real use requires setting it. |
| `CITRINEOS_INTEGRATIONS_V2GCA_HUBJECT_CLIENTSECRET` | string | `YOUR_CLIENT_SECRET` | Client secret — likewise a placeholder. |

### `INTEGRATIONS_CHARGINGSTATIONCA`

For station certificates via ACME.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_INTEGRATIONS_CHARGINGSTATIONCA` | JSON object | unset | Set to `'{}'` to enable ACME against the Let's Encrypt staging directory. |
| `CITRINEOS_INTEGRATIONS_CHARGINGSTATIONCA_NAME` | `acme` | `acme` | Provider. ACME is the only implementation. |
| `CITRINEOS_INTEGRATIONS_CHARGINGSTATIONCA_ACME_ENV` | `staging` \| `production` | `staging` | Which ACME directory to use. `staging` issues untrusted certs but has generous rate limits. |
| `CITRINEOS_INTEGRATIONS_CHARGINGSTATIONCA_ACME_ACCOUNTKEYFILEPATH` | string | `certificates/acme_account_key.pem` | ACME account key, resolved against the `fileAccess` root. |
| `CITRINEOS_INTEGRATIONS_CHARGINGSTATIONCA_ACME_EMAIL` | string (email) | `test@citrineos.com` | Contact address registered with the ACME account. |

## `RBAC` — optional

Set `CITRINEOS_RBAC='{}'` to enable with defaults.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_RBAC_RULESDIR` | string | unset | Directory holding the rules file. |
| `CITRINEOS_RBAC_RULESFILENAME` | string | `rbac-rules.json` | Rules file mapping tenant → URL pattern → HTTP method → required roles. |

## `SWAGGER`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_SWAGGER_ENABLED` | boolean | `true` | Serves the API docs. Set `false` in production if you do not want them exposed. |
| `CITRINEOS_SWAGGER_PATH` | string | `/docs` | Mount path for the docs UI. |
| `CITRINEOS_SWAGGER_LOGOPATH` | string | `src/assets/logo.png` | Logo shown in the docs. Resolved from the process working directory, **not** from `fileAccess`. |
| `CITRINEOS_SWAGGER_EXPOSEDATA` | boolean | `true` | Includes response data schemas in the docs. |
| `CITRINEOS_SWAGGER_EXPOSEMESSAGE` | boolean | `true` | Includes message schemas in the docs. |

## `TIMEOUTS`

`TIMEOUTS_MAXCACHINGSECONDS` must be greater than or equal to `TIMEOUTS_MAXCALLLENGTHSECONDS`, or startup fails.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_TIMEOUTS_MAXCALLLENGTHSECONDS` | integer >= 1 | `20` | How long an OCPP call may remain outstanding before it is considered timed out. |
| `CITRINEOS_TIMEOUTS_MAXCACHINGSECONDS` | integer >= 1 | `30` | How long call state is cached. Cannot be lower than `maxCallLengthSeconds`. |
| `CITRINEOS_TIMEOUTS_STALECALLMAXAGESECONDS` | integer >= 1 | unset | Age past which a pending call is discarded as stale. |
| `CITRINEOS_TIMEOUTS_SHUTDOWNGRACEPERIODSECONDS` | integer >= 1 | `30` | How long shutdown waits for in-flight work before forcing exit. |
| `CITRINEOS_TIMEOUTS_REALTIMEAUTHDEFAULTTIMEOUTSECONDS` | integer >= 1 | `15` | How long a real-time authorization request waits for a decision. |
| `CITRINEOS_TIMEOUTS_NOTREADYTHRESHOLDSECONDS` | integer >= 1 | `60` | How long the instance may be unhealthy before it reports not-ready. |

## `OCPP`

These apply to every OCPP version — there is no per-protocol split.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_OCPP_HEARTBEATINTERVAL` | integer >= 1 | `60` | Heartbeat interval in seconds sent to stations on boot. |
| `CITRINEOS_OCPP_BOOTRETRYINTERVAL` | integer >= 1 | `15` | Retry interval in seconds sent when a boot is Pending or Rejected. |
| `CITRINEOS_OCPP_UNKNOWNCHARGERSTATUS` | `Accepted` \| `Pending` \| `Rejected` | `Accepted` | Boot status returned to a station with no `BootConfig` row. |
| `CITRINEOS_OCPP_GETBASEREPORTONPENDING` | boolean | `true` | Requests a base report from stations left in Pending. |
| `CITRINEOS_OCPP_BOOTWITHREJECTEDVARIABLES` | boolean | `false` | Allows a boot to proceed even when some variables were rejected. |
| `CITRINEOS_OCPP_AUTOACCEPT` | boolean | `true` | Promotes boot status automatically. When `false`, a station stays where it is until something changes it explicitly. |

## `TRANSACTIONS`

Exactly one of `TRANSACTIONS_COSTUPDATEDINTERVAL` or `TRANSACTIONS_SENDCOSTUPDATEDONMETERVALUE` must be set — setting both, 
or neither, fails startup.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_TRANSACTIONS_COSTUPDATEDINTERVAL` | integer >= 1 | `60` (from the block default) | Sends a cost update on a fixed interval, in seconds. |
| `CITRINEOS_TRANSACTIONS_SENDCOSTUPDATEDONMETERVALUE` | boolean | unset | Sends a cost update on each meter value instead of on an interval. |
| `CITRINEOS_TRANSACTIONS_RECEIPTBASEURL` | string (URL) | unset | Base URL used to build receipt links for completed transactions. |
| `CITRINEOS_TRANSACTIONS_SIGNEDMETERVALUES_PUBLICKEYFILEID` | string | — | Required within the block. File ID of the public key used to verify signed meter values. |
| `CITRINEOS_TRANSACTIONS_SIGNEDMETERVALUES_SIGNINGMETHOD` | `RSASSA-PKCS1-v1_5` \| `ECDSA` \| `SECP192R1` | — | Required within the block. Signature algorithm to verify against. |
| `CITRINEOS_TRANSACTIONS_SIGNEDMETERVALUES_REJECTUNSUPPORTEDSIGNEDMETERVALUES` | boolean | `false` | Rejects signed meter values that do not match the configured method rather than accepting them unverified. |

## `EVDRIVER`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_EVDRIVER_ENABLEGETCHARGINGPROFILESONSTARTTRANSACTION` | boolean | `false` | Requests the station's charging profiles when a transaction starts. |