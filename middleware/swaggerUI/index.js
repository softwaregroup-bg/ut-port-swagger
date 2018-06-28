const send = require('koa-send');
const root = require('swagger-ui-dist').getAbsoluteFSPath();
const html = require('./html');
module.exports = ({options, swaggerDocument}) => {
    const {pathRoot, skipPaths} = options;
    const pathPrefix = pathRoot.endsWith('/') ? pathRoot : pathRoot + '/';
    const htmlBody = html(swaggerDocument, pathPrefix);
    return async (ctx, next) => {
        if (ctx.method === 'GET' && ctx.path.startsWith(pathRoot)) {
            if (ctx.path === pathRoot) {
                ctx.type = 'text/html; charset=utf-8';
                ctx.body = htmlBody;
                ctx.status = 200;
                return;
            }
            if (ctx.path === (pathPrefix + 'api-docs')) {
                ctx.type = 'application/json; charset=utf-8';
                ctx.body = swaggerDocument;
                ctx.status = 200;
                return;
            }
            if (!skipPaths.some(current => ctx.path.startsWith(current))) {
                const filePath = ctx.path.substring(pathRoot.length);
                await send(ctx, filePath, { root });
                return;
            }
        }
        return next();
    };
};
