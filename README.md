# UT Port Swagger

Swagger comp

## Configuration

```js
{
  // UT specific configuration
  namespace: 'swagger',
  // swagger document, path to swagger document or a function
  document: null,
  // json schema schemas.
  /*
    Should be a key-value object
    where the key is the name of the entity
    and the value is the schema itself.
  */
  schemas: {},
  // static content
  /*
    static contet that will be automatically served by the server.
    e.g. {
      status: ['pending', 'approved']
    }
    then the following route will be exposed:
    GET /meta/content/status
    which will return the payload: ['pending', 'approved']
    The content properties are tokenized and can be used
    within the schemas and swagger document via interpolation.
    I.e.
    {
      ...
      "status": {
        "type": "string",
        "enum": "${status}",
        "title": "The status Schema "
      }
    }
  */
  content: {},
  // middleware options
  /*
    These below are the default options.
    In order to configure a certain middleware
    just provide the options for the respective key.
    In order to disable a certain middleware
    just provide false as its value.

    The middleware chain order is as follows:
    [
      'wrapper',
      'swaggerUI',
      'cors',
      'formParser',
      'bodyParser',
      'jwt',
      'router',
      'validator',
      'contextProvider',
      'requestHandler'
    ]

    Note: contextProvider is an explicit middleware
    and cannot be configured.
  */

  middleware: {
      wrapper: {},
      swaggerUI: {
          pathRoot: '/docs',
          skipPaths: []
      },
      cors: {},
      formParser: {},
      bodyParser: {},
      jwt: false,
      router: {},
      validator: {
          request: true,
          response: true
      },
      requestHandler: {}
  },
  // http server connection options
  // https://nodejs.org/api/net.html#net_server_listen_options_callback
  // {port, host, path, backlog, exclusive, readableAll, writableAll}
  server: {}
}
```

## Headers

### Request headers

Access the request headers from `$meta.requestHeaders`

### Response headers

In order to set response headers
just attach a responseHeaders object in $meta
from the bus method that has been called. E.g

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

* `x-bus-method` - specifies the controller
(the bus method which will be executed when the respective http route gets called)

## JSON Schema custom keywords

* `x-occurrences` - specifies that certain field
should appear in a way compliant with the provided specification.
Example:

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
