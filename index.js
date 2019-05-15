'use strict';
const swaggerParser = require('swagger-parser');
const Koa = require('koa');
const middleware = require('./middleware');
const errors = require('./errors.json');
const swaggerContext = require('./context');
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
            };
        }
        async init(...params) {
            Object.assign(this.errors, registerErrors(errors));

            let document;
            switch (typeof this.config.document) {
                case 'function':
                    document = this.config.document.call(this);
                    break;
                case 'string':
                    document = await swaggerParser.bundle(this.config.document);
                    break;
                default:
                    document = this.config.document;
            }

            if (!document) throw this.errors['swagger.documentNotProvided']();

            const {staticRoutesPrefix, namespace, context, schemas} = this.config;

            const {swaggerDocument, handlers} = swaggerContext(this, {
                document,
                staticRoutesPrefix,
                namespace,
                schemas,
                context
            });

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
