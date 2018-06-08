const koaRouter = require('koa-router');
const koaCompose = require('koa-compose');
const requestHandler = require('./requestHandler');
module.exports = ({port, options}) => {
    const router = koaRouter(options);
    Object.keys(port.swaggerDocument.paths).forEach(path => {
        const fullPath = [port.swaggerDocument.basePath, path].filter(x => x).join('');
        const collection = port.swaggerDocument.paths[path];
        Object.keys(collection).forEach(method => {
            router[method](fullPath, requestHandler(port, collection[method]['x-bus-method']));
        });
    });
    return koaCompose([
        router.routes(),
        router.allowedMethods()
    ]);
};
