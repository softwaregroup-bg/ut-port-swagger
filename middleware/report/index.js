const dotProp = require('dot-prop');

const getReportHandler = (port, { methods = true, exchange = '', namespace = '' }) => {
    if (!namespace) throw new Error('report namespace is required');

    if (typeof namespace !== 'string') throw new Error('report namespace must be a string');

    if (!exchange) throw new Error('report exchange is required');

    if (typeof exchange !== 'string') throw new Error('report exchange must be a string');

    const handlers = {};

    const getHandler = ctx => {
        if (!ctx.ut.method) return;
        const handler = handlers[ctx.ut.method];
        if (!handler && methods === true) return setHandler(ctx.ut.method);
        return handler;
    };

    const setHandler = (method, data = {}) => {
        const tokens = method.split('.').slice(-2);
        const {
            objectType = tokens[0],
            eventType = tokens[1],
            objectId = 'request.msg.id'
        } = data;
        const handler = handlers[method] = async ctx => {
            try {
                await port.bus.importMethod(`${namespace}.${exchange}.${objectType}`)({
                    objectId: dotProp.get({request: ctx.ut, response: ctx.body}, objectId),
                    eventType,
                    objectType,
                    data: ctx.ut.msg,
                    messageAddedDate: new Date()
                });
            } catch (e) {
                if (port.log.error) port.log.error(e);
            }
        };
        return handler;
    };

    if (typeof methods === 'object') {
        if (Array.isArray(methods)) {
            methods.forEach(setHandler);
        } else {
            Object.entries(methods).forEach(setHandler.apply.bind(null));
        }
    }

    return async(ctx, error) => {
        const handler = getHandler(ctx);

        if (!handler) return;

        try {
            await handler(ctx);
        } catch (e) {
            if (port.log.error) port.log.error(e);
        }
    };
};

module.exports = ({port, options}) => {
    const report = getReportHandler(port, options);

    return async(ctx, next) => {
        await next();
        report(ctx);
    };
};
