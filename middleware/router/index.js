const uuid = require('uuid');
const koaRouter = require('koa-router');
const koaCompose = require('koa-compose');
const sanitize = (path) => {
    // transform path parameter definitions from swagger 2 to koa 2 standard: /{id} -> /:id
    return path.replace(/\{([^}]*)\}/g, (placeHolder, label) => `:${label}`);
};
// https://swagger.io/docs/specification/2-0/authentication/
// Using Multiple Authentication Types
const extractSecurity = (securityDefinition) => securityDefinition.reduce((a, s) => {
    const auth = Object.keys(s);
    a = a.concat((auth.length > 1 && [auth]) || auth);
    return a;
}, []);

const evaluateStateAnd = (arr, checkState) => arr.reduce((a, c) => (!a && false) || (a && !!checkState[c]), true);

const evaluateStateOr = (checkArray) => (checkState) => checkArray.reduce((final, current) => {
    if (final) {
        return final;
    }
    if (Array.isArray(current)) {
        return !!evaluateStateAnd(current, checkState);
    } else {
        return !!checkState[current];
    }
}, false);

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
            const successCodeResult = successCodes[0] ? parseInt(successCodes[0]) : 200;
            const securityRules = (security && extractSecurity(security)) || [];

            router[methodName](fullPath, (ctx, next) => {
                ctx.ut.successCode = successCodeResult;
                ctx.ut.securityCheck = evaluateStateOr(securityRules);
                ctx.ut.security = securityRules.reduce((a, c) => a.concat(c), []);
                ctx.ut.securityCheckState = {};
                ctx.ut.method = operationId;
                ctx.ut.$meta = {
                    mtid: 'request',
                    trace: ctx.request.headers['x-trace'] || uuid.v4(),
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
