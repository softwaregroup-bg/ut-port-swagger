const swagger2Koa = require('swagger2-koa');
const swaggerParser = require('swagger-parser');
const errorsFactory = require('./errorsFactory');
const utils = require('./utils');
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
                // port, host, path, backlog, exclusive, readableAll, writableAll
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
            paths.forEach(path => {
                Object.keys(swaggerDocument.paths[path]).forEach(method => {
                    const methodName = swaggerDocument.paths[path][method]['x-bus-method'];
                    swaggerRouter[method](path, async (ctx, next) => {
                        const {params, query} = ctx;
                        const {body} = ctx.request;
                        const trace = utils.uuid.v4();
                        if (this.log.trace) {
                            this.log.trace({$meta: {mtid: 'request', trace}, body, params, query});
                        }
                        return new Promise(resolve => {
                            const msg = Object.assign({}, body, params, query);
                            const $meta = {
                                trace,
                                mtid: 'request',
                                method: methodName,
                                reply: (response, $responseMeta) => {
                                    switch ($responseMeta.mtid) {
                                        case 'response':
                                            ctx.body = response;
                                            ctx.status = 200;
                                            break;
                                        case 'error':
                                            ctx.status = (response.details && response.details.statusCode) || 400;
                                            ctx.body = {
                                                error: response
                                            };
                                            break;
                                        default:
                                            ctx.status = 400;
                                            ctx.body = {
                                                error: this.errors.swagger({cause: response})
                                            };
                                            break;
                                    }
                                    return resolve(next());
                                }
                            };
                            this.stream.push([msg, $meta]);
                        });
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
            let {port, host, path, backlog, exclusive, readableAll, writableAll} = this.config;
            this.server = app
                .use(swagger2Koa.ui(swaggerDocument, this.config.pathRoot, this.config.skipPaths))
                .listen({port, host, path, backlog, exclusive, readableAll, writableAll});

            this.log.info && this.log.info({
                message: 'Swagger port started',
                address: this.server.address(),
                $meta: {
                    mtid: 'event',
                    opcode: 'port.started',
                    paths: paths.sort()
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
