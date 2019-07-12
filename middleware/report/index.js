const dotProp = require('dot-prop');

const getReportHandler = (port, { namespace, exchange, routingKey, options, methods = true }) => {
    const assertString = (key, value) => {
        if (!value || typeof value !== 'string') {
            throw new Error(`${port.config.id}.middleware.report.${key} must be a string`);
        }
    };
    assertString('namespace', namespace);
    assertString('exchange', exchange);
    assertString('routingKey', routingKey);

    const sendToQueue = port.bus.importMethod(`${namespace}.${exchange}.${routingKey}`);

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
            const { tenantId = null } = ctx.ut.$meta.auth || {};
            const payload = {
                tenantId,
                objectId: dotProp.get({request: ctx.ut, response: ctx.body}, objectId),
                service: port.bus.config.implementation,
                eventType,
                objectType,
                data: ctx.ut.msg,
                messageAddedDate: Date.now() / 1000 | 0 // unix timestamp
            };
            try {
                await sendToQueue({
                    payload,
                    options,
                    exchange,
                    routingKey
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
            Object.entries(methods).forEach(([method, data]) => setHandler(method, data));
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
