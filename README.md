# UT Port Swagger

Swagger compliant http server

## Headers

### Request headers
Access the request headers from `$meta.requestHeaders`

### Response headers
In order to set response headers just attach a responseHeaders object in $meta from the bus method that has been called. E.g
```js
  function(incomingMessage, $meta) {
    $meta.responseHeaders = {
      'x-test': 'x-test response header value'
    };
    const outgoingMessage = {
      test: 1
    };
    return outgoingMessage;
  }
```

## OpenAPI Schema extensions

* `x-bus-method` - specifies the controller (the bus method which will be executed when the respective http route gets called)

## JSON Schema custom keywords
* `x-occurrences` - specifies that certain field should appear in a way compliant with the provided specification. Example:
 ```json
 {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "personalData": {
        "type": "object",
        "properties": {
          "phones": {
            "type": "array",
            "x-occurrences": [
              {
                "key": "isPrimary",
                "value": true,
                "min": 1,
                "max": 1
              },
              {
                "key": "isMWallet",
                "value": true,
                "min": 0,
                "max": 1
              }
            ],
            "items": {
              "type": "object",
              "properties": {
                "mno": {
                  "type": "string",
                  "title": "The Mno Schema ",
                  "default": "",
                  "example": "A1"
                },
                "phoneType": {
                  "type": "string",
                  "title": "The Phonetype Schema ",
                  "default": "",
                  "example": "home"
                },
                "phoneNumber": {
                  "type": "string",
                  "title": "The Phonenumber Schema ",
                  "default": "",
                  "example": "359787666555"
                },
                "isPrimary": {
                  "type": "boolean",
                  "title": "The Isprimary Schema ",
                  "default": false,
                  "example": true
                },
                "isMWallet": {
                  "type": "boolean",
                  "title": "The Ismwallet Schema ",
                  "default": false,
                  "example": true
                }
              }
            }
      }
    }
  }

 ```
