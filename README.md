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
      'report',
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
      report: false,
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

This middleware is responsible for sending audit data events
to a message queue (Rabbit MQ).

* configuration options
  * `namespace` (required) - Rabbit MQ producer port namespace
  * `exchange` (required) - Rabbit MQ exchange
  * `routingKey` (required) - Rabbit MQ routing key
  * `options` (optional) - Rabbit MQ options.
  May include `headers`, `type`, `appId`, etc...
  [see amqplib channel publish options](http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish)

  For more info about `options`, `exchange` and `routingKey`
  check `ut-port-amqp` [docs](https://github.com/softwaregroup-bg/ut-port-amqp#producer-port)

  Example:

  ```json
  {
    "swagger": {
      "middleware": {
        "audit": {
          "namespace": "audit",
          "exchange": "asdfasdf",
          "routingKey": "gfgfd",
          "options": {
            "headers": {
              "__TypeId__": "com.softwaregroup.audit.dto.AuditDto"
            }
          }
        }
      }
    }
  }
  ```

### report

This middleware is responsible for sending reporting data events
to a message queue (Rabbit MQ).

* configuration options
  * `namespace` (required) - Rabbit MQ producer port namespace
  * `exchange` (required) - Rabbit MQ exchange
  * `routingKey` (required) - Rabbit MQ routing key
  * `options` (optional) - Rabbit MQ options.
  May include `headers`, `type`, `appId`, etc...
  [see amqplib channel publish options](http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish)

  For more info about `options`, `exchange` and `routingKey`
  check `ut-port-amqp` [docs](https://github.com/softwaregroup-bg/ut-port-amqp#producer-port)
  * `service` (required) - mandatory field to be included in the payload
  * `methods` (optional) - Which bus methods to be reported
    * if omitted then all methods will be reported
    * if an array of strings (each record representing a method name).
    Then the respective methods will be reported
    * if an object (each key representing a method name)
    Then the respective methods will be reported.
    The value can be used to override the reported `objectId`, `eventType` and `objectType`

  Examples:

  * Report all methods:

  ```json
  {
    "swagger": {
      "middleware": {
        "report": {
          "namespace": "audit",
          "exchange": "exchange",
          "routingKey": "reporting",
          "service": "serviceName"
        }
      }
    }
  }
  ```

  * Report certain methods only

  ```json
  {
    "swagger": {
      "middleware": {
        "report": {
          "namespace": "audit",
          "exchange": "exchange",
          "routingKey": "reporting",
          "service": "serviceName",
          "methods": [
            "a.b.c",
            "d.e.f"
          ]
        }
      }
    }
  }
  ```

  * Report certain methods with overrides

  ```json
  {
    "swagger": {
      "middleware": {
        "report": {
          "namespace": "audit",
          "exchange": "exchange",
          "routingKey": "reporting",
          "service": "serviceName",
          "methods": {
            "a.b.c": {},
            "d.e.f": {
              "objectType": "test"
            },
            "g.h.i": {
              "objectType": "test",
              "eventType": "edit"
            },
            "j.k.l": {
              "objectId": "request.msg.id"
            }
          }
        }
      }
    }
  }
  ```

  **NOTE**: objectId must be in `dot-prop` format. Check [docs](https://github.com/sindresorhus/dot-prop#getobject-path-defaultvalue).
  If set then the respective objectId will be automatically extracted.
  the `dot-prop` object is formed as follows: ```{request: {msg, $meta}, response}```.
  So the possible paths would be:
  * request.msg.*
  * request.$meta.*
  * response.*

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
