const swagger2Koa = require('swagger2-koa');
const swaggerParser = require('swagger-parser');
const errorsFactory = require('./errorsFactory');
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
                // swagger2-koa specific options
                // https://github.com/carlansley/swagger2-koa#uidocument-pathroot---skippaths----koa2-middleware
                definitionPath: '', // absolute path to the swagger document
                pathRoot: '/docs',
                skipPaths: []
                // http server connection options
                // https://nodejs.org/api/net.html#net_server_listen_options_callback
                // port, host, path, backlog, exclusive
            }, params.config);
            Object.assign(this.errors, errorsFactory(this.bus));
        }

        async init() {
            await super.init();
        }

        async start() {
            this.context = {requests: {}};
            this.stream = this.pull(false, this.context);
            await super.start();
            const swaggerDocument = await swaggerParser.bundle(this.config.definitionPath);
            await swaggerParser.validate(swaggerDocument);
            const swaggerRouter = swagger2Koa.router(swaggerDocument);
            const paths = Object.keys(swaggerDocument.paths);
            if (this.log.trace) {
                this.log.trace({$meta: {mtid: 'config', opcode: 'paths'}, message: paths.sort()});
            }
            paths.forEach(path => {
                Object.keys(swaggerDocument.paths[path]).forEach(method => {
                    const busMethod = this.bus.importMethod(swaggerDocument.paths[path][method]['x-method']);
                    // "x-swagger-router-controller": "Weather"
                    swaggerRouter[method](path, async (ctx, next) => {
                        const {params, query} = ctx;
                        const {body} = ctx.request;
                        if (this.log.trace) {
                            this.log.trace({$meta: {mtid: 'request'}, body, params, query});
                        }
                        try {
                            ctx.body = await busMethod(Object.assign({}, body, params, query));
                            ctx.status = 200;
                            if (this.log.trace) {
                                this.log.trace({$meta: {mtid: 'response'}, body: ctx.body, status: ctx.status});
                            }
                        } catch (error) {
                            ctx.status = (error.details && error.details.statusCode) || 400;
                            ctx.body = {
                                error
                            };
                            if (this.log.error) {
                                this.log.error({$meta: {mtid: 'error'}, body: ctx.body, status: ctx.status});
                            }
                        }
                        await next();
                    });
                });
            });
            const app = swaggerRouter.app();
            app.middleware.unshift(async (ctx, next) => {
                await next();
                if (ctx.status < 200 || ctx.status >= 300) {
                    if (!ctx.body || !ctx.body.error || !ctx.body.error.type) {
                        ctx.status = 400;
                        ctx.body = this.errors.swagger({cause: ctx.body});
                    }
                }
            });
            let {port, host, path, backlog, exclusive} = this.config;
            this.server = app
                .use(swagger2Koa.ui(swaggerDocument, this.config.pathRoot, this.config.skipPaths))
                .listen({port, host, path, backlog, exclusive});
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
