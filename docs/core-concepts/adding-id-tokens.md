---
title: Adding ID Tokens
---

# Adding ID Tokens

With any CSMS, a valid `ID Token` must be loaded into the system for charging to be allowed.

To quickly do this with CitrineOS, you can run the following `cURL` command which will invoke CitrineOS's Data API:

```bash
curl --location --request PUT 'localhost:8080/data/evdriver/authorization?idToken=01&type=Central' \
--header 'Content-Type: application/json' \
--data '{
    "idToken": {
        "idToken": "01",
        "type": "Central"
    },
    "idTokenInfo": {
        "status": "Accepted"
    }
}'
```
