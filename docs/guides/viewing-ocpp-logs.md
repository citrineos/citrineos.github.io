---
title: Viewing OCPP Logs
---

# Via Application Logs

You can view application logs either via Docker or the console of wherever CitrineOS was started from.

Below is an example of an OCPP log as found in the console:

    2026-07-15 19:19:24.993	DEBUG /packages/ocpp/dist/src/util/queue/rabbit-mq/sender.js:85	CitrineOS Logger:RabbitMqSender	Publishing to citrineos: {
      origin: 'cs',
      eventGroup: 'router',
      action: 'StatusNotification',
      context: {
        ocppConnectionName: 'cp001',
        correlationId: 'af5e40d8-211a-4ba7-92c6-99fe36b8596e',
        tenantId: 1,
        timestamp: '2026-07-15T19:19:24.993Z'
      },
      state: 1,
      protocol: 'ocpp2.1',
      payload: {
        connectorId: 1,
        connectorStatus: 'Available',
        evseId: 2,
        timestamp: '2026-07-15T19:19:24.796Z'
      }
    }

# Via Subscription

You can use CitrineOS's Data API to subscribe to OCPP messages. Below is the `cURL` command that will subscribe the 
specified URL to all OCPP messages and connection events for charger `cp001` in the default tenant:

    curl --request POST 'localhost:8080/ocpprouter/subscription?tenantId=1' \
    --header 'Content-Type: application/json' \
    --data '{
      "ocppConnectionName": "cp001",
      "onConnect": true,
      "onClose": true,
      "onMessage": true,
      "sentMessage": true,
      "url": "<the url that will receive the messages>"
    }'

