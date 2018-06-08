const koaRouter = require('koa-router');
const koaCompose = require('koa-compose');
const requestHandler = require('./requestHandler');
module.exports = ({port, options, swaggerDocument}) => {
    const router = koaRouter(options);
    Object.keys(swaggerDocument.paths).forEach(path => {
        const fullPath = [swaggerDocument.basePath, path].filter(x => x).join('');
        const collection = swaggerDocument.paths[path];
        Object.keys(collection).forEach(method => {
            router[method](fullPath, requestHandler(port, collection[method]['x-bus-method']));
        });
    });
    return koaCompose([
        router.routes(),
        router.allowedMethods()
    ]);
};
