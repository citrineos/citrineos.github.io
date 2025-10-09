---
title: CitrineOS-Core REST API
---


## Overview

The CitrineOS Core REST API provides a comprehensive interface for managing charging stations and related operations. 
This API serves as an integration point for external systems, such as frontends or other services to interact with CitrineOS.

## API Structure

The API is organized into several functional modules which loosely correspond to OCPP modules:

- **Certificates** - Manage TLS certificates and charging station security
- **Configuration** - Control charging station settings, firmware updates, and network profiles
- **Evdriver** - Handle EV driver operations like starting/stopping transactions and reservations
- **Monitoring** - Monitor charging station variables and set up alerting
- **Reporting** - Generate reports and retrieve charging station data
- **Smartcharging** - Manage charging profiles and load balancing
- **Transactions** - Handle charging transactions and billing
- **Ocpprouter** - Manage OCPP message routing and subscriptions

## Authentication

CitrineOS can be configured to either skip authentication and authorization by setting the `localByPass` config to `true`, or to require a Bearer token for OIDC authentication.  
**Warning:** Skipping authentication is only recommended for local testing and should never be used in production.

When authentication is required, every API request must include an `Authorization` header with a valid Bearer token.

```
Authorization: Bearer <your-token>
```
<swagger-ui src="/assets/swagger.json"/>
