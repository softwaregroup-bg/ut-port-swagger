'use strict';
const errorsFactory = require('./errorsFactory');
const uuid = require('uuid');
const swaggerParser = require('swagger-parser');
const swagger2 = require('swagger2');
const Koa = require('koa');
const koaCors = require('koa-cors');
const koaFormidable = require('koa2-formidable');
const koaBodyparser = require('koa-bodyparser');
const koaRouter = require('koa-router');
const ui = require('./ui');

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
            this.ctx = {
                requests: {}
            };
            this.stream = this.pull(false, this.ctx);
            await super.start();

            const swaggerDocument = await swaggerParser.bundle(this.config.definitionPath);
            await swaggerParser.validate(swaggerDocument);
            const paths = Object.keys(swaggerDocument.paths);

            const router = koaRouter();
            paths.forEach(path => {
                const fullPath = [swaggerDocument.basePath, path].filter(x => x).join('');
                const collection = swaggerDocument.paths[path];
                Object.keys(collection).forEach(method => {
                    const spec = collection[method];
                    const methodName = spec['x-bus-method'];
                    router[method](fullPath, async (ctx, next) => {
                        const {
                            params,
                            query
                        } = ctx;
                        const {
                            body
                        } = ctx.request;
                        const trace = uuid.v4();
                        if (this.log.trace) {
                            this.log.trace({
                                $meta: {
                                    mtid: 'request',
                                    trace
                                },
                                body,
                                params,
                                query
                            });
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
                                                error: this.errors.swagger({
                                                    cause: response
                                                })
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
            const app = new Koa();
            app.use(async (ctx, next) => {
                await next();
                if (ctx.status < 200 || ctx.status >= 300) {
                    if (!ctx.body || !ctx.body.error || !ctx.body.error.type) {
                        ctx.status = 400;
                        ctx.body = this.errors.swagger({
                            cause: ctx.body
                        });
                    }
                }
            });
            app.use(koaCors());
            app.use(koaFormidable());
            app.use(koaBodyparser());
            const compiled = swagger2.compileDocument(swaggerDocument);
            app.use(async (ctx, next) => {
                if (!ctx.path.startsWith(swaggerDocument.basePath)) {
                    return next();
                }
                let compiledPath = compiled(ctx.path);
                if (compiledPath === undefined) {
                    // if there is no single matching path, return 404 (not found)
                    ctx.status = 404;
                    return true;
                }
                let validationErrors = swagger2.validateRequest(compiledPath, ctx.method, ctx.request.query, ctx.request.body);
                if (validationErrors === undefined) {
                    // operation not defined, return 405 (method not allowed)
                    ctx.status = 405;
                    return;
                }

                if (validationErrors.length > 0) {
                    ctx.status = 400;
                    ctx.body = {
                        code: 'SWAGGER_REQUEST_VALIDATION_FAILED',
                        errors: validationErrors
                    };
                    return;
                }

                // wait for the operation to execute
                await next();

                // check the response matches the swagger schema
                let error = swagger2.validateResponse(compiledPath, ctx.method, ctx.status, ctx.body);
                if (error) {
                    error.where = 'response';
                    ctx.status = 500;
                    ctx.body = {
                        code: 'SWAGGER_RESPONSE_VALIDATION_FAILED',
                        errors: [error]
                    };
                }
            });
            app.use(router.routes());
            app.use(router.allowedMethods());
            app.use(ui(swaggerDocument, this.config.pathRoot, this.config.skipPaths));
            this.server = app.listen({
                port: this.config.port,
                host: this.config.host,
                path: this.config.path,
                backlog: this.config.backlog,
                exclusive: this.config.exclusive,
                readableAll: this.config.readableAll,
                writableAll: this.config.writableAll
            });
            this.log.info && this.log.info({
                message: 'Swagger port started',
                address: this.server.address(),
                paths: paths.sort(),
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
