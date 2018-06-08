const send = require('koa-send');
const root = require('swagger-ui-dist').getAbsoluteFSPath();
const html = require('./html');
module.exports = ({options, swaggerDocument}) => {
    const {pathRoot, skipPaths} = options;
    const pathPrefix = pathRoot.endsWith('/') ? pathRoot : pathRoot + '/';
    const htmlBody = html(swaggerDocument, pathPrefix);
    return async (context, next) => {
        if (context.method === 'GET' && context.path.startsWith(pathRoot)) {
            if (context.path === pathRoot) {
                context.type = 'text/html; charset=utf-8';
                context.body = htmlBody;
                context.status = 200;
                return;
            }
            if (context.path === (pathPrefix + 'api-docs')) {
                context.type = 'application/json; charset=utf-8';
                context.body = swaggerDocument;
                context.status = 200;
                return;
            }
            if (!skipPaths.some(current => context.path.startsWith(current))) {
                const filePath = context.path.substring(pathRoot.length);
                await send(context, filePath, { root });
                return;
            }
        }
        return next();
    };
};
