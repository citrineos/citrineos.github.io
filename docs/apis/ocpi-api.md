---
title: OCPI REST API
---

# Authentication

Every API request must include an `Authorization` header with a Base64-encoded Token, where
the original value should match a Tenant Partner's server token.

```
Authorization: Token <your-Base64-encoded-token>
```

# API
<swagger-ui src="../../assets/ocpi-swagger.json"/>
