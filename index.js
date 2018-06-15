'use strict';
const errorsFactory = require('./errorsFactory');
const swaggerParser = require('swagger-parser');
const Koa = require('koa');
const middleware = require('./middleware');

module.exports = (params = {}) => {
    const Port = params.parent;
    class SwaggerPort extends Port {
        constructor(params = {}) {
            super(params);
            this.config = this.merge({
                // UT specific configuration
                id: 'swagger',
                type: 'swagger',
                logLevel: 'debug',
                document: null, // swagger document, path to swagger document or a function
                // middleware options
                middleware: {
                    cors: {},
                    formParser: {},
                    bodyParser: {},
                    validator: {},
                    swaggerUI: {
                        pathRoot: '/docs',
                        skipPaths: []
                    },
                    router: {}
                },
                // http server connection options
                // https://nodejs.org/api/net.html#net_server_listen_options_callback
                // {port, host, path, backlog, exclusive, readableAll, writableAll}
                server: {}
            }, params.config);
            Object.assign(this.errors, errorsFactory(this.bus));
        }

        async init() {
            await super.init();
        }

        async start() {
            // this.bus.importMethods(this.config, this.config.imports, {request: true, response: true}, this);
            this.stream = this.pull(false, { requests: {} });
            await super.start();
            let swaggerDocument;
            switch (typeof this.config.document) {
                case 'function':
                    swaggerDocument = this.config.document.call(this);
                    break;
                case 'string':
                    swaggerDocument = await swaggerParser.bundle(this.config.document);
                    break;
                default:
                    swaggerDocument = this.config.document;
            }
            await swaggerParser.validate(swaggerDocument);
            const app = new Koa();
            if (this.config.middleware) {
                let i = 0;
                let n = middleware.length;
                for (; i < n; i += 1) {
                    let {name, factory} = middleware[i];
                    let options = this.config.middleware[name];
                    if (options !== false && options !== 'false') {
                        app.use(await factory({
                            port: this,
                            swaggerDocument,
                            options: Object.assign({}, options)
                        }));
                    }
                }
            }
            this.server = app.listen(this.config.server);
            this.log.info && this.log.info({
                message: 'Swagger port started',
                address: this.server.address(),
                $meta: {
                    mtid: 'event',
                    opcode: 'port.started'
                }
            });
        }

        async stop() {
            this.server.close();
            await super.stop();
        }
    }

    return SwaggerPort;
};
