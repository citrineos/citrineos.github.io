---
title: FAQs (Frequently Asked Questions)
---

/// details | What versions OCPP are supported?
    type: info
    open: true

OCPP 1.6 and 2.x are supported by CitrineOS. For more information about the differences between versions, 
[click here](https://openchargealliance.org/protocols/open-charge-point-protocol/).
///

/// details | Can CitrineOS support multiple protocols at the same time?
    type: info
    open: true

Yes, CitrineOS can support chargers using different protocols at the same time. CitrineOS knows the protocol of the charger
based on the protocol sent as part of the websocket connection.
///

/// details | What APIs are available?
    type: info
    open: true
    
CitrineOS uses REST API to support communications with charging stations and GraphQL to support database operations. For more
information about the Core REST API, [click here](/apis/core-api).

///

/// details | What versions of OCPI are supported?
    type: info
    open: true

OCPI 2.2.1 is supported by CitrineOS. Refer to the [roadmap](/roadmap) for information on upcoming OCPI version support.
///

/// details | What technologies support CitrineOS?
    type: info
    open: true

CitrineOS is a TypeScript-based Node.js application with a PostgreSQL database and RabbitMQ message broker. The Operator UI
is a NextJS-based web application with GraphQL integration to CitrineOS's data.
///