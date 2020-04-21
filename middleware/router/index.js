const uuid = require('uuid');
const koaRouter = require('koa-router');
const koaCompose = require('koa-compose');
const sanitize = (path) => {
    // transform path parameter definitions from swagger 2 to koa 2 standard: /{id} -> /:id
    return path.replace(/\{([^}]*)\}/g, (placeHolder, label) => `:${label}`);
};
module.exports = ({port, options}) => {
    const router = koaRouter(options);
    Object.keys(port.swaggerDocument.paths).forEach(path => {
        const fullPath = [port.swaggerDocument.basePath, sanitize(path)].filter(x => x).join('');
        const collection = port.swaggerDocument.paths[path];
        Object.keys(collection).forEach(methodName => {
            const method = collection[methodName];
            const {operationId, security, responses} = method;
            if (!operationId) {
                throw port.errors['swagger.operationIdNotDefined']({method});
            }
            const successCodes = Object.keys(responses).filter(code => code >= 200 && code < 300);
            if (successCodes.length > 1) {
                throw port.errors['swagger.successCodesCount']({
                    params: {
                        expected: 1,
                        actual: successCodes.length
                    },
                    responses
                });
            }

            const successCode = successCodes[0] ? parseInt(successCodes[0]) : 200;

            router[methodName](fullPath, (ctx, next) => {
                ctx.ut.successCode = successCode;
                ctx.ut.security = security;
                ctx.ut.method = operationId;
                ctx.ut.$meta = {
                    mtid: 'request',
                    trace: ctx.request.headers['x-trace'] || uuid.v4(),
                    method: operationId,
                    headers: ctx.request.headers,
                    rawBody: ctx.request.rawBody
                };
                return next();
            });
        });
    });
    return koaCompose([
        router.routes(),
        router.allowedMethods(),
        (ctx, next) => {
            if (!ctx.ut.method) {
                ctx.status = 404;
                throw port.errors['swagger.routeNotFound']();
            }
            return next();
        }
    ]);
};
