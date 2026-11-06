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
| `CITRINEOS_DATABASE_SCHEMA` | string | `public` | The database schema, defaults to public. |
| `CITRINEOS_DATABASE_VALIDATESCHEMA` | boolean | `true` | If true, verifies at startup that the schema in the code and the database match.  |
| `CITRINEOS_DATABASE_VALIDATESCHEMASEVERITY` | `error` \| `warn` | `error` | If `error`, will block the application from running upon schema validation if there are differences. If `warn`, will not stop startup. |

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
| `CITRINEOS_MESSAGEBROKER_AMQP_PREFETCH_MODULESTALE` | integer ≥ 0 | `1` | Prefetch for a module's **catch-up queue**, which takes Calls that outlived `maxCallLengthSeconds` before a module got to them. |
| `CITRINEOS_MESSAGEBROKER_AMQP_REEMITMAXRETRYSECONDS` | integer ≥ 1 | `300` | How long the router keeps re-emitting a message for a station that no router instance currently holds before dead-lettering it as unroutable. Retries back off, and stop early if the Call goes stale. |
| `CITRINEOS_MESSAGEBROKER_AMQP_DEADLETTERQUEUE_MAXLENGTH` | integer ≥ 1 | `100000` | Max message count on the dead-letter queue (`<exchange>.dlq`). |
| `CITRINEOS_MESSAGEBROKER_AMQP_DEADLETTERQUEUE_MAXLENGTHBYTES` | integer ≥ 1 | `536870912` (512 MiB) | Max total size of the dead-letter queue. |

### `MESSAGEBROKER_AMQP_PREFETCH`

To configure each respective RabbitMQ implementation's prefetch count.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_MESSAGEBROKER_AMQP_PREFETCH_ROUTER` | integer >= 0 | 100 | OCPP Router's RabbitMQ prefetch count. |
| `CITRINEOS_MESSAGEBROKER_AMQP_PREFETCH_MODULE` | integer >= 0 | 10 | CitrineOS Modules' RabbitMQ prefetch count. |
| `CITRINEOS_MESSAGEBROKER_AMQP_PREFETCH_MESSAGES` | integer >= 0 | 50 | Messages Module's RabbitMQ prefetch count. |
| `CITRINEOS_MESSAGEBROKER_AMQP_PREFETCH_MESSAGESDEADLETTER` | integer >= 0 | 10 | Messages Module's Dead Letter's RabbitMQ prefetch count. |

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
| `CITRINEOS_FILEACCESS_S3_ENDPOINT` | string | unset | Custom endpoint URL. |
| `CITRINEOS_FILEACCESS_S3_DEFAULTBUCKETNAME` | string | `citrineos-s3-bucket` | Bucket used when a key carries no bucket of its own. |
| `CITRINEOS_FILEACCESS_S3_S3FORCEPATHSTYLE` | boolean | `true` | Path-style addressing, required by most S3-compatible servers. |
| `CITRINEOS_FILEACCESS_S3_ACCESSKEYID` | string | unset | Access key. The AWS SDK's own `AWS_*` variables also work. |
| `CITRINEOS_FILEACCESS_S3_SECRETACCESSKEY` | string | unset | Secret key. |

### When `FILEACCESS_TYPE` is `gcp`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_FILEACCESS_GCP_PROJECTID` | string | — | Required. GCP project ID. |
| `CITRINEOS_FILEACCESS_GCP_DEFAULTBUCKETNAME` | string | `citrineos-s3-bucket` | Bucket name. |
| `CITRINEOS_FILEACCESS_GCP_CREDENTIALS` | JSON object | unset | Service account credentials inline. If unset, Application Default Credentials are used. |

## `AUTH`

Guards the HTTP API.

| Variable | Type | Default | What it does |
|---|---|---|---|
| `CITRINEOS_AUTH_MODE` | `jwt` \| `localDev` \| `localBypass` | **`localDev`** | How API callers are authenticated. `localDev` *enforces* auth using tokens the server mints itself (`POST /dev/token`); `localBypass` accepts every request. |
| `CITRINEOS_AUTH_JWT_JWKSURI` | string | — | Required when mode is `jwt`. |
| `CITRINEOS_AUTH_JWT_ISSUER` | string | — | Required when mode is `jwt`. Must equal the token's `iss` exactly. |
| `CITRINEOS_AUTH_JWT_AUDIENCE` | string | unset | **Optional** (the doc says required). If unset, any token from the issuer is accepted, and a warning is logged at startup. |
| `CITRINEOS_AUTH_JWT_ROLESCLAIM` | string (dotted path) | `roles` | Where roles are read from in the token, e.g. `resource_access.<client>.roles`. |
| `CITRINEOS_AUTH_JWT_TENANTCLAIM` | string (dotted path) | `tenant_id` | Where the tenant id is read from in the token. |
| `CITRINEOS_AUTH_JWT_CACHETIMESECONDS` | integer ≥ 1 | unset | JWKS key cache time. |
| `CITRINEOS_AUTH_JWT_RATELIMIT` | boolean | `true` | Rate-limits JWKS fetches. |
| `CITRINEOS_AUTH_LOCALDEV_ROLES` | string[] | `["admin"]` | Roles put in a `/dev/token` token when the request names none. |
| `CITRINEOS_AUTH_LOCALDEV_TOKENTTLSECONDS` | integer ≥ 1 | `43200` (12h) | Lifetime of minted dev tokens. |
| `CITRINEOS_AUTH_LOCALBYPASS_ROLES` | string[] | `["admin"]` | Roles every request is treated as having in `localBypass` mode. |

## `OIDCCLIENT` — optional

Credentials the server uses as an OIDC *client* when calling out. All four are required if the block is set.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_OIDCCLIENT_TOKENURL` | string | — | Token endpoint. |
| `CITRINEOS_OIDCCLIENT_CLIENTID` | string | — | Client ID. |
| `CITRINEOS_OIDCCLIENT_CLIENTSECRET` | string | — | Client secret. |
| `CITRINEOS_OIDCCLIENT_AUDIENCE` | string | — | Audience requested in the token. |

## `ROLES`

| Variable | Type | Default | What it does |
|---|---|---|---|
| `CITRINEOS_ROLES_SEEDFILE` | string | `roles-seed.json` | Role definitions file, resolved against the `fileAccess` root. Format: `{ "<role>": { "resources": {...}, "permissions": [...] } }`. |
| `CITRINEOS_ROLES_REFRESHINTERVALSECONDS` | integer ≥ 1 | `60` | How often the file is re-read. Changes need no restart. A failed re-read keeps the last good policy. A failed *first* load is fatal under `jwt` and `localDev`. |
| `CITRINEOS_ROLES_COMMON` | string[] | `["permissions.user.get"]` | Permissions granted to every authenticated caller. |

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

### `INTEGRATIONS_OCSP`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_INTEGRATIONS_OCSP_ALLOWEDRESPONDERHOSTS` | array of string | unset | Hosts the CSMS is permitted to reach for OCSP. Empty means no restriction. |

## `SWAGGER`

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_SWAGGER_ENABLED` | boolean | `true` | Serves the API docs. Set `false` in production if you do not want them exposed. |
| `CITRINEOS_SWAGGER_PATH` | string | `/docs` | Mount path for the docs UI. |
| `CITRINEOS_SWAGGER_LOGOPATH` | string | `src/assets/logo.png` | Logo shown in the docs. Resolved from the process working directory, **not** from `fileAccess`. |
| `CITRINEOS_SWAGGER_EXPOSEMESSAGE` | boolean | `true` | Includes message schemas in the docs. |

## `TIMEOUTS`

`TIMEOUTS_MAXCACHINGSECONDS` must be greater than or equal to `TIMEOUTS_MAXCALLLENGTHSECONDS`, or startup fails.

| Variable | Type | Default | What it does |
| --- | --- | --- | --- |
| `CITRINEOS_TIMEOUTS_MAXCALLLENGTHSECONDS` | integer >= 1 | `20` | How long an OCPP call may remain outstanding before it is considered timed out. |
| `CITRINEOS_TIMEOUTS_MAXCACHINGSECONDS` | integer >= 1 | `30` | How long call state is cached. Cannot be lower than `maxCallLengthSeconds`. |
| `CITRINEOS_TIMEOUTS_STALECALLMAXAGESECONDS` | integer ≥ 0 | `40` | Age past which a pending call is discarded as stale. |
| `CITRINEOS_TIMEOUTS_SHUTDOWNGRACEPERIODSECONDS` | integer >= 1 | `30` | How long shutdown waits for in-flight work before forcing exit. |
| `CITRINEOS_TIMEOUTS_REALTIMEAUTHDEFAULTTIMEOUTSECONDS` | integer >= 1 | `15` | How long a real-time authorization request waits for a decision. |
| `CITRINEOS_TIMEOUTS_REALTIMEAUTHREQUESTTIMEOUTSECONDS` | integer ≥ 1 | `10` | HTTP timeout on the outbound request to the real-time authorization endpoint. This is different from `REALTIMEAUTHDEFAULTTIMEOUTSECONDS`, which is the authorizer's own wait for a decision. |
| `CITRINEOS_TIMEOUTS_NOTREADYTHRESHOLDSECONDS` | integer >= 1 | `60` | How long the instance may be unhealthy before it reports not-ready. |

## `LOGREDACTION`

| Variable | Type | Default | What it does |
|---|---|---|---|
| `CITRINEOS_LOGREDACTION_KEYS` | string[] | `["password"]` | Property names censored at any depth, case-insensitively. |
| `CITRINEOS_LOGREDACTION_PATHS` | string[] | `[]` | Dotted paths to censor; `*` matches one segment. |
| `CITRINEOS_LOGREDACTION_PATTERNS` | string[] (regex) | `[]` | Regexes applied globally to logged strings. Invalid regexes fail startup. |
| `CITRINEOS_LOGREDACTION_PLACEHOLDER` | string | `[***]` | Replacement text. |
| `CITRINEOS_LOGREDACTION_REDACTKEYCODES` | boolean | `true` | Redacts OCPP `KeyCode` idTokens, per OCPP 2.x C04.FR.04. |

## `CALIFORNIAPRICING`

| Variable | Type | Default | What it does |
|---|---|---|---|
| `CITRINEOS_CALIFORNIAPRICING_ENABLED` | boolean | `false` | Registers the California Pricing module (OCPP 1.6). When `false`, `APP_NAME=californiapricing` isn't available. |

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
| `CITRINEOS_OCPP_MAXPENDINGCALLSPERSTATION` | integer ≥ 1 | `5` | OCPP allows one outstanding CSMS Call per station; extra Calls queue behind it. Past this many queued, a new Call is **dead-lettered** (reason `Overflow`) instead of queued. |

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


## `NETWORKALERTS`

These are system-wide defaults. Per-tenant overrides live in the `NetworkAlertConfigs` table and are layered on top,
and each tenant's resolved config is cached for one sweep interval. Severities are `Critical` | `Warning` | `Info`.

| Variable | Type | Default | What it does |
|---|---|---|---|
| `CITRINEOS_NETWORKALERTS_SWEEPINTERVALSECONDS` | integer ≥ 1 | `30` | How often the sweeper evaluates time-based rules. Also the per-tenant config cache TTL. |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_ENABLED` | boolean | `true` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_DISCONNECTSEVERITY` | severity | `Info` | Alert raised on each disconnect. |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_FREQUENTDISCONNECTS_COUNT` | integer > 0 | `5` | Disconnects within the window that trigger an alert. |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_FREQUENTDISCONNECTS_WINDOWSECONDS` | integer > 0 | `3600` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_FREQUENTDISCONNECTS_SEVERITY` | severity | `Warning` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_OFFLINETOOLONG_SECONDS` | integer > 0 | `900` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_OFFLINETOOLONG_SEVERITY` | severity | `Critical` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_STATIONCONNECTIVITY_RULES_MISSEDHEARTBEATS` | integer > 0 | `2` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_CONNECTORSTATUS_ENABLED` | boolean | `true` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_CONNECTORSTATUS_RULES_SEVERITYBYSTATUS` | JSON map status → severity | `{"Unavailable":"Warning","Faulted":"Critical"}` | Set as one JSON value, since it's a record. |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_ENABLED` | boolean | `true` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SEVERITYBYREASON_CALLERROR` | severity | `Warning` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SEVERITYBYREASON_TIMEOUT` | severity | `Warning` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SEVERITYBYREASON_SENDFAILED` | severity | `Info` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SEVERITYBYREASON_SLOW` | severity | `Warning` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_CRITICALACTIONS` | string[] | `["TransactionEvent","StartTransaction","StopTransaction"]` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SLOWTHRESHOLDMS` | integer > 0 | `5000` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_SLOWSAMPLESIZE` | integer > 0 | `10` | |
| `CITRINEOS_NETWORKALERTS_DEFAULTS_OCPPCALLFAILURES_RULES_QUIETPERIODSECONDS` | integer > 0 | `1800` | |