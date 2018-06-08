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
                swaggerDocument: null,
                swaggerPath: '', // absolute path to the swagger document
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
            this.stream = this.pull(false, { requests: {} });
            await super.start();
            this.swaggerDocument = this.config.swaggerDocument || await swaggerParser.bundle(this.config.swaggerPath);
            await swaggerParser.validate(this.swaggerDocument);
            const app = new Koa();
            this.config.middleware && [
                // middleware order
                'cors',
                'formParser',
                'bodyParser',
                'validator',
                'swaggerUI',
                'router'
            ].forEach(name => {
                if (this.config.middleware[name] !== false && this.config.middleware[name] !== 'false') {
                    app.use(middleware[name]({
                        port: this,
                        options: Object.assign({}, this.config.middleware[name])
                    }));
                }
            });
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
