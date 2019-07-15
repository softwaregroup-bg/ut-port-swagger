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
            // build once upon initialization
            const ut = {
                successCode: successCodes[0] ? parseInt(successCodes[0]) : 200,
                security: {
                    jwt: Array.isArray(security) && security.length > 0
                },
                method: operationId
            };
            router[methodName](fullPath, (ctx, next) => {
                ctx.ut.successCode = ut.successCode;
                ctx.ut.security = ut.security;
                ctx.ut.method = ut.method;
                ctx.ut.$meta = {
                    mtid: 'request',
                    trace: uuid.v4(),
                    method: ctx.ut.method,
                    headers: ctx.request.headers
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
