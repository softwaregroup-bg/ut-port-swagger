'use strict';
const swaggerParser = require('swagger-parser');
const Koa = require('koa');
const middleware = require('./middleware');
const errors = require('./errors.json');
const swaggerContext = require('./context');
const interpolationRegex = /^\$\{[\w]+(\.[\w]+)*\}$/i;
const interpolate = (schema, context) => {
    switch (typeof schema) {
        case 'string':
            if (interpolationRegex.test(schema)) {
                const tokens = schema.slice(2, -1).split('.');
                while (tokens.length) {
                    context = context[tokens.shift()];
                    if (!context) {
                        return schema;
                    }
                }
                return context;
            }
            return schema;
        case 'object':
            if (Array.isArray(schema)) {
                return schema.map(item => interpolate(item, context));
            } else {
                return Object.keys(schema).reduce((all, key) => {
                    all[key] = interpolate(schema[key], context);
                    return all;
                }, {});
            }
        default:
            return schema;
    }
};
module.exports = ({utPort, registerErrors}) => {
    return class SwaggerPort extends utPort {
        get defaults() {
            return {
                // UT specific configuration
                id: 'swagger',
                type: 'swagger',
                namespace: 'swagger',
                document: null, // swagger document, path to swagger document or a function
                schemas: {}, // json schema schemas
                context: {}, // static context
                staticRoutesPrefix: '', // prefix for auto generated static routes. e.g: '/meta'
                // middleware options
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
            };
        }
        async init(...params) {
            Object.assign(this.errors, registerErrors(errors));

            const {context} = this.config;

            const schemas = interpolate(this.config.schemas, context);

            let document;
            switch (typeof this.config.document) {
                case 'function':
                    document = this.config.document.call(this);
                    break;
                case 'string':
                    const regExp = /\$(%7B|{)(.*)(}|%7D)$/i;
                    document = await swaggerParser.bundle(this.config.document, {
                        resolve: {
                            schemas: {
                                order: 1,
                                canRead: regExp,
                                read({url}, cb) {
                                    const selector = regExp.exec(url)[2];
                                    cb(null, interpolate(`\${${selector}}`, {schemas}));
                                }
                            }
                        }
                    });
                    break;
                default:
                    document = this.config.document;
            }

            if (!document) throw this.errors['swagger.documentNotProvided']();

            const {staticRoutesPrefix, namespace} = this.config;

            const swaggerDocument = interpolate(document, context);

            const {handlers, paths} = swaggerContext(this, {
                swaggerDocument,
                staticRoutesPrefix,
                namespace,
                schemas,
                context
            });

            Object.assign(swaggerDocument.paths, paths);

            await swaggerParser.validate(swaggerDocument);

            this.swaggerDocument = swaggerDocument;

            this.app = new Koa();

            if (!this.config.middleware) this.config.middleware = {};
            this.config.middleware.contextProvider = {handlers};

            for (let i = 0, n = middleware.length; i < n; i += 1) {
                let {name, factory} = middleware[i];
                let options = this.config.middleware[name];
                if (typeof options === 'object') {
                    this.app.use(await factory({
                        port: this,
                        options
                    }));
                }
            }

            if (this.config.server.host) {
                this.config.k8s = {
                    ports: [{
                        name: 'http-swagger',
                        service: true,
                        ingress: {
                            host: this.config.server.host
                        },
                        containerPort: this.config.server.port
                    }]
                };
            }

            return super.init(...params);
        }
        async start(...params) {
            const startResult = await super.start(...params);
            this.stream = this.pull(false, { requests: {} });
            this.server = this.app.listen(this.config.server);
            return startResult;
        }
        stop() {
            this.server && this.server.close();
            return super.stop();
        }
    };
};
