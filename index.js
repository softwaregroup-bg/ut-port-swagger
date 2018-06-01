'use strict';
const errorsFactory = require('./errorsFactory');
const swaggerParser = require('swagger-parser');
const Koa = require('koa');
const koaRouter = require('koa-router');
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
                definitionPath: '', // absolute path to the swagger document
                // swagger ui options
                pathRoot: '/docs',
                skipPaths: []
                // http server connection options
                // https://nodejs.org/api/net.html#net_server_listen_options_callback
                // port, host, path, backlog, exclusive, readableAll, writableAll
            }, params.config);
            Object.assign(this.errors, errorsFactory(this.bus));
        }

        async init() {
            await super.init();
        }

        async start() {
            this.stream = this.pull(false, { requests: {} });
            await super.start();
            const swaggerDocument = await swaggerParser.bundle(this.config.definitionPath);
            await swaggerParser.validate(swaggerDocument);
            const router = koaRouter();
            Object.keys(swaggerDocument.paths).forEach(path => {
                const fullPath = [swaggerDocument.basePath, path].filter(x => x).join('');
                const collection = swaggerDocument.paths[path];
                Object.keys(collection).forEach(method => {
                    router[method](fullPath, middleware.requestHandler(this, collection[method]['x-bus-method']));
                });
            });
            const app = new Koa();
            app.use(middleware.cors());
            app.use(middleware.formParser());
            app.use(middleware.bodyParser());
            app.use(middleware.validator(this, swaggerDocument));
            app.use(middleware.swaggerUI(this, swaggerDocument));
            app.use(router.routes());
            app.use(router.allowedMethods());
            let {port, host, path, backlog, exclusive, readableAll, writableAll} = this.config;
            this.server = app.listen({port, host, path, backlog, exclusive, readableAll, writableAll});
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
