'use strict';
const swaggerParser = require('swagger-parser');
const Koa = require('koa');
const middleware = require('./middleware');
const errors = require('./errors.json');
const swaggerContext = require('./context');
const interpolate = require('ut-function.interpolate');
const dotProp = require('dot-prop');
const regExp = /^\$\{([a-z0-9]+(\.[a-z0-9]+)*)\}$/i;

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
                    basicAuth: false,
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

            const schemas = interpolate(this.config.schemas, {context}, false, regExp);

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
                                    cb(null, dotProp.get({schemas}, selector, selector));
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

            const swaggerDocument = interpolate(document, {context}, false, regExp);

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
                const {name, factory} = middleware[i];
                const options = this.config.middleware[name];
                if (typeof options === 'object') this.app.use(await factory({port: this, options}));
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
