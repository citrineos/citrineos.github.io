---
layout: default
title: Framework
---

# Framework

Citrine is an OCPP 2.0.1 Charging Station Management System (CSMS) designed to be adaptable to various infrastructures and easily extensible via modular design. It uses the [fastify](https://github.com/fastify/fastify) web framework.

Below is a diagram to introduce you to Citrine's high-level architecture:
![Citrine's High-level Framework](/assets/images/CitrineFramework.drawio.svg)

> N.B.: In the diagram above the websocket connections pass through the cloud before touching the central system. The definitions for the central system in 00_Base do not require direct websocket connectivity. Use of an infrastructure layer between the websockets and central system, such as [AWS's API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html), is thus supported. The implementation which lives in 50_Server handles the websockets directly.

## Adaptable

Citrine's code structure includes 3 common packages: 00_Base, 10_Data, and 99_Util.

### 00_Base

00_Base defines the interfaces and abstract classes needed for the Central System and Module implementations. All OCPP messages and datatypes are here as well.

### 10_Data

10_Data implements all the logic for Citrine's persistent data, stored in a relational database. This package is powered by [sequelize-typescript](https://github.com/sequelize/sequelize-typescript). New modules which add persistent datatypes will need to extend this package.

### 99_Util

99_Util contains implementations of various infrastructure components and tools. This includes memory caches such as [redis](https://github.com/redis/redis) and a simple Javascript memory cache implementation, and message buses such as [google pubsub](https://github.com/googleapis/nodejs-pubsub), [kafka](https://github.com/tulios/kafkajs), and an AMPQP-compatible implementation using [amqlib](https://github.com/amqp-node/amqplib). This module can be extended to add additional infrastructure options.

## Modular

Citrine's central system communicates with modules via message bus subscriptions. They can also share access to a memory cache and a relational database.
The OCPP Functional Blocks have been implemented in packages which define Citrine modules. Not all Functional Blocks have packages yet, and the ones which do exist are not fully implemented.

### 01_Provisioning

This package contains the Citrine module responsible for the Provisioning OCPP Functional Block.

### 02_Authorization

This package contains the Citrine module responsible for the Authorization OCPP Functional Block.

### 03_Availability

This package contains the Citrine module responsible for the Availability OCPP Functional Block.

### 04_Transaction

This package contains the Citrine module responsible for the Transactions OCPP Functional Block.

### 05_Monitoring

This package contains the Citrine module responsible for handling monitoring messages triggered by GetMonitoringReport.

__

### Other Module Examples

Outside of the OCPP 2.0.1 protocol, modules could do things like provide OCPI interfaces, feed data to analysis tools, handle payments, or more.

## Up Next: [QuickStart](/quickstart.html)

Our implementation, 50_Server, and how you can use it!
