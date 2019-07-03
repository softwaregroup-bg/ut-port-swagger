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
  // static context
  /*
    static contet that will be automatically served by the server.
    e.g. {
      status: ['pending', 'approved']
    }
    then the following route will be exposed:
    GET /context/status
    which will return the payload: ['pending', 'approved']
    The context properties are tokenized and can be used
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
  context: {},
  // prefix for auto generated static routes. e.g: '/meta'
  // if set then static routes like /context/status for example will become /meta/context/status
  staticRoutesPrefix: '',
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
      'audit',
      'swaggerUI',
      'cors',
      'conditionalGet',
      'etag',
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
      audit: false,
      swaggerUI: {
          pathRoot: '/docs',
          skipPaths: []
      },
      cors: {},
      conditionalGet: {},
      etag: {},
      formParser: false,
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

## Middleware

### wrapper
TO DO: `wrapper` middleware description

### audit
This middleware is responsible for sending audit events to a message queue (Rabbit MQ).
* configuration options
  * `method` (required) - what bus method to be called with the generated audit message
  * `options` (optional) - Rabbit MQ options. May include `headers`, `type`, `appId`, etc...
  [see amqplib channel publish options](http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish)
  * `exchange` (optional) - Rabbit MQ exchange
  * `routingKey` (optional) - Rabbit MQ routing key

  For more info about `options`, `exchange` and `routingKey`
  check `ut-port-amqp` [docs](https://github.com/softwaregroup-bg/ut-port-amqp#producer-port)

  Example:
  ```
  {
    swagger: {
      middleware: {
        audit: {
          method: 'audit.a.b.c' // required
          options: { // optional
            headers: {
              __TypeId__: 'com.softwaregroup.audit.dto.AuditDto'
            }
          },
          exchange: 'asdfasdf', // optional
          routingKey: 'gfgfd' // optional
        }
      }
    }
  }
  ```

### swaggerUI
TO DO: `swaggerUI` middleware description

### cors
TO DO: `cors` middleware description

### conditionalGet
TO DO: `conditionalGet` middleware description

### etag
TO DO: `etag` middleware description

### formParser
TO DO: `formParser` middleware description

### bodyParser
TO DO: `bodyParser` middleware description

### jwt
TO DO: `jwt` middleware description

### router
TO DO: `router` middleware description

### validator
TO DO: `validator` middleware description

### contextProvider
TO DO: `contextProvider` middleware description

### requestHandler
TO DO: `requestHandler` middleware description

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

## OpenAPI Schema specifics

* `operationId` - specifies the controller
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
