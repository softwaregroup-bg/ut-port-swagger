# UT Port Swagger

## Configuration

```js
{
  // UT specific configuration
  namespace: 'swagger',
  // static context
  /*
    static content that will be automatically served by the server.
    e.g. {
      status: ['pending', 'approved']
    }
    then the following route will be exposed:
    GET /context/status
    which will return the payload: ['pending', 'approved']
  */
  context: {},
  // json schema schemas.
  /*
    Should be a key-value object
    where the key is the name of the entity
    and the value is the schema itself.

    The context properties are tokenized and can be used
    within the schemas via interpolation.
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
  schemas: {},
    // swagger document, path to swagger document or a function
    /*
    The context properties and the schemas are tokenized and can be used
    within the swagger document via interpolation.
    I.e.
    {
      ...
      "status": {
        "type": "string",
        "enum": "${context.status}",
        "title": "The status Schema "
      }
    }
    or
    {
      "definitions": {
        "someSchema": "${schemas.someSchema}"
      }
    }
    */
  document: null,
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
      'auth',
      'basicAuth',
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
      basicAuth: false,
      jwt: false,
      router: {},
      auth: {},
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

* configuration options
  * `formatError` [ function ]: fn (error, ctx): give ability to
  developer to do what it wants

keep in mind that if error have meta property with property status (meta.status)
it will remove meta property from the error and set status to return status
code of http server

### audit

This middleware is responsible for sending audit data events
to a message queue (Rabbit MQ)

* configuration options
  * `namespace` (required) [ string ] - Rabbit MQ producer port namespace
  * `exchange` (required) [ string ] - Rabbit MQ exchange
  * `routingKey` (required) [ string ] - Rabbit MQ routing key
  * `format` (optional) [ string | function ] - Payload formatter.
  By default it is the `dw` formatter.
  * `options` (optional) [ object ] - Rabbit MQ options.
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
  * `namespace` (required) [ string ] - Rabbit MQ producer port namespace
  * `exchange` (required) [ string ] - Rabbit MQ exchange
  * `routingKey` (required) [ string ] - Rabbit MQ routing key
  * `format` (optional) [ string | function ] - Payload formatter.
  By default it is the `dw` formatter.
  * `options` (optional) [ object ] - Rabbit MQ options.
  May include `headers`, `type`, `appId`, etc...
  [see amqplib channel publish options](http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish)

  For more info about `options`, `exchange` and `routingKey`
  check `ut-port-amqp` [docs](https://github.com/softwaregroup-bg/ut-port-amqp#producer-port)
  * `service` (required) [ string ] - mandatory field to be included in the payload
  * `methods` (optional) [ object | array ] - Which bus methods to be reported
    * if omitted then all methods will be reported
    * if an array of strings (each record representing a method name).
    Then the respective methods will be reported
    * if an object (each key representing a method name)
    Then the respective methods will be reported.
    The value can be used to override the reported
    `objectId`, `eventType`, `objectType` and `data`

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
              "objectId": "request.msg.id",
              "data": {
                "idCustom": "request.msg.id"
              }
            }
          }
        }
      }
    }
  }
  ```

  **NOTE**: `objectId` and `data` object values can be in `dot-prop` format.
  Check [docs](https://github.com/sindresorhus/dot-prop#getobject-path-defaultvalue).
  If set then the respective objectId will be automatically extracted.
  the `dot-prop` object is formed as follows: ```{request: {msg, $meta}, response}```.
  So the possible paths would be:
  * request.msg.*
  * request.$meta.*
  * response.*

  If not set in `dot-prop` format or it represents a path that
  doesn't exist then the value itself will be set as a fallback.

  If provided, the `data` object will be merged with the request message.
  `data` properties are treated as defaults so if any keys match
  they will be overridden by the message.

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

### basicAuth

For configuration options please check
[basic-auth](https://github.com/koajs/basic-auth)

* configuration options
  * `identities` (required) [ array | function ] -
    * if array: array of objects `{name: 'username', pass: 'password'}`
    * if function: function receives 1 argument,
    object: `{name: 'username', pass: 'password'}`
    so it can validate against this object
  * `realm` (optional) [ string ] - Response header text on wrong auth

### jwt

This middleware lets you authenticate HTTP requests
using JSON Web Tokens in your application.

If the token is not valid then an error will be thrown.

If the token gets successfully validated
then the `$meta.auth` property will be populated
with fields extracted from token's payload.

`$meta.auth` is represented by a normalized
data structure no matter what identity provider
had generated the token.
This is achieved by the concept of `formatters`.
Currently only `keycloak` format is supported
but more formats can be added in the long term
in case any need for that arises. The formatter
is set via the `format` property
(see the examples below). It should be either
a string or a function. If a string then a
predefined formatter will be used (an error will
be thrown if no matching formatter is found). If
a custom function is provided then it will be
called with jwt's body for each incoming HTTP request.
The standard `$meta.auth` content format is:

```js
{
    // user's session id (null if no info)
    sessionId: 'sessionId',
    // user's business unit id (null if no info)
    businessUnitId: 'businessUnitId',
    // user's business unit name(null if no info)
    businessUnitName: 'businessUnitName',
    // user's tenant id (null if no info)
    tenantId: 'tenantId',
    // user's tenant name (null if no info)
    tenantName: 'tenantName',
    // user's id (null if no info)
    userId: 'userId',
    // user's username (null if no info)
    username: 'username',
    // user's full name (null if no info)
    name: 'name',
    // user's roles (empty array if no info)
    roles: ['role1', 'role2']
}

```

#### configuration examples

Using a symmetric key:

```json
  {
    "swagger": {
      "middleware": {
        "jwt": {
          "secret": "secret",
          "format": "keycloak"
        }
      }
    }
  }
```

The token is normally provided in a HTTP header (Authorization)
but it can also be provided in a cookie.
Specify that by setting the 'cookie' option.
In the example below the middleware will expect the token
to be found at `Cookie: "ut5-cookie=encryptedJwtToken"`

```json
  {
    "swagger": {
      "middleware": {
        "jwt": {
            "cookie": "ut5-cookie",
            "secret": "ut5-secret",
            "format": "ut5"
        }
      }
    }
  }
```

You can specify audience and/or issuer as well:

```json
  {
    "swagger": {
      "middleware": {
        "jwt": {
          "secret": "secret",
          "audience": "http://myapi/protected",
          "issuer": "http://issuer",
          "format": "keycloak"
        }
      }
    }
  }
```

You can also specify an array of secrets.

```json
  {
    "swagger": {
      "middleware": {
        "jwt": {
          "secret": ["oldSecret", "newSecret"],
          "format": "keycloak"
        }
      }
    }
  }
```

The token will be considered valid if it validates
successfully against any of the supplied secrets.
This allows for rolling shared secrets.

This middleware also supports verification via public keys

```js
  const publicKey = fs.readFileSync('/path/to/public.pub');
  return {
    swagger: {
      middleware: {
        jwt: {
          secret: publicKey,
          format: 'keycloak'
        }
      }
    }
  };
```

The secret option can also be a function.
If the secret option is a function,
this function is called for each JWT received
in order to determine which secret is used to verify the JWT.
The signature of this function should be
`(header, payload) => [Promise(secret)]`,
where header is the token header
and payload is the token payload.

JWKS (JSON Web Key Set) support is also provided.
For example:

```json
{
  "swagger": {
    "middleware": {
      "jwt": {
        "jwks": {
          "jwksUri": "http://host:port/auth/realms/Test/protocol/openid-connect/certs",
          "cache": true,
          "cacheMaxEntries": 5,
          "cacheMaxAge": 86400000
        },
        "audience": "some-audience",
        "issuer": "http://host:port/auth/realms/Test",
        "format": "keycloak"
      }
    }
  }
}
```

### auth

This middleware can be used to switch on / off
the authorization of the incoming http requests.
if `auth` is explicitly set to `false` the authorization
mechanisms will be disabled even if `jwt` or `basicAuth`
middlewares are enabled.

### router

TO DO: `router` middleware description

### validator

TO DO: `validator` middleware description

### contextProvider

TO DO: `contextProvider` middleware description

### requestHandler

This middleware is responsible for dispatching the requests
to the backend.

* configuration options
  * `authorize` (optional) [ string | function ] - Authorization handler.
  The authorization would fail if the handler returns
  a falsy value or throws an error.
  * `transformRequest` (optional) [ function ] - Global request
  transformation handler.
  * `transformResponse` (optional) [ function ] - Global response
   transformation handler.
  * `transformErrorResponse` (optional) [ function ] - Global error response
   transformation handler.

  Examples:

  * Custom handler on port level (recommended):

  ```js
    module.exports = (...params) => {
      return class swagger extends require('ut-port-swagger')(...params) {
        get defaults() {
          return {
            middleware: {
              requestHandler: {
                authorize: function({message, $meta}) {
                  // apply authorization logic
                  // based on message and $meta

                  // successful authorization
                  return true;

                  // reject unauthorized
                  // return false;

                  // reject unauthorized with specific error
                  // throw new Error('xxx')
                },
                transformRequest: function(message, $meta) {
                  return message;
                },
                transformResponse: function(message, $meta) {
                  return message;
                }
              }
            }
          }
        }
      }
    };
  ```

  * Custom handler in js config:

  ```js
    {
      swagger: {
        middleware: {
          requestHandler: {
            authorize: function({message, $meta}) {
              // apply authorization logic
              // based on message and $meta
            }
          }
        }
      }
    }
  ```

  * Authorization via bus method:

  ```json
    {
      "swagger": {
        "middleware": {
          "requestHandler": {
            "authorize": "custom.authorization.handler"
          }
        }
      }
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

## Cookies

In order to set response cookies
just attach a cookies array in $meta
from the bus method that has been called. E.g

```js
  function(incomingMessage, $meta) {
    $meta.cookies = [
      ['cookie1Name', 'cookie1Value', {/*cookie 1 options*/}],
      ['cookie2Name', 'cookie2Value', {/*cookie 2 options*/}]
    ];
    const outgoingMessage = {
      test: 1
    };
    return outgoingMessage;
  }
```

For more information about how to describe
cookies check [koa documentation](https://github.com/koajs/koa/blob/master/docs/api/context.md#ctxcookiessetname-value-options)

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
                  "title": "The phoneType Schema ",
                  "default": "",
                  "example": "home"
                },
                "phoneNumber": {
                  "type": "string",
                  "title": "The phoneNumber Schema ",
                  "default": "",
                  "example": "359787666555"
                },
                "isPrimary": {
                  "type": "boolean",
                  "title": "The isPrimary Schema ",
                  "default": false,
                  "example": true
                },
                "isMWallet": {
                  "type": "boolean",
                  "title": "The isMWallet Schema ",
                  "default": false,
                  "example": true
                }
              }
            }
      }
    }
  }

```

## Known issues

Setting `ut-port-swagger` as a
dependency will not work out of the box!!!

Temporary solution:

Explicitly set a dependency to
[swagger-ui-dist](https://www.npmjs.com/package/swagger-ui-dist)
in your package.json
