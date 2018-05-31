const send = require('koa-send');
const SWAGGER_UI_PATH = require('swagger-ui-dist').getAbsoluteFSPath();
const html = require('./html');
module.exports = (document, pathRoot = '/', skipPaths = []) => {
    const pathPrefix = pathRoot.endsWith('/') ? pathRoot : pathRoot + '/';
    const htmlBody = html(document, pathPrefix);
    return async (context, next) => {
        if (context.path.startsWith(pathRoot)) {
            const skipPath = skipPaths.some((current) => context.path.startsWith(current));
            if (context.path === pathRoot && context.method === 'GET') {
                context.type = 'text/html; charset=utf-8';
                context.body = htmlBody;
                context.status = 200;
                return;
            } else if (context.path === (pathPrefix + 'api-docs') && context.method === 'GET') {
                context.type = 'application/json; charset=utf-8';
                context.body = document;
                context.status = 200;
                return;
            } else if (!skipPath && context.method === 'GET') {
                const filePath = context.path.substring(pathRoot.length);
                await send(context, filePath, { root: SWAGGER_UI_PATH });
                return;
            }
        }
        return next();
    };
};
