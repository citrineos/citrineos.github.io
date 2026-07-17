---
title: FAQs (Frequently Asked Questions)
---

/// details | What OCPP Protocols are supported?
    type: info
    open: true

OCPP 1.6, 2.0.1, and 2.1 are supported by CitrineOS. For more information about the differences between versions, 
[click here](https://openchargealliance.org/protocols/open-charge-point-protocol/).
///

/// details | Can CitrineOS support multiple protocols at the same time?
    type: info
    open: true

Yes, CitrineOS can support chargers using different protocols at the same time. CitrineOS knows the protocol of the charger
based on the protocol sent as part of the websocket connection.
///

/// details | What APIs does CitrineOS use?
    type: info
    open: true
    
CitrineOS uses REST API to support communications with the Charging Station and GraphQL to support database operations.

///