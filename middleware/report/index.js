const formats = {
    dw: require('./format/dw')
};

const getReportHandler = (port, {
    namespace,
    exchange,
    routingKey,
    options,
    service,
    methods = true,
    format = 'dw'
}) => {
    const assertString = (key, value) => {
        if (!value || typeof value !== 'string') {
            throw new Error(`${port.config.id}.middleware.report.${key} must be a string`);
        }
    };
    assertString('namespace', namespace);
    assertString('exchange', exchange);
    assertString('routingKey', routingKey);
    assertString('service', service);

    const formatPayload = typeof format === 'function' ? format : formats[format];

    if (typeof formatPayload !== 'function') throw new Error(`Unsupported audit format: ${format}`);

    const sendToQueue = port.bus.importMethod(`${namespace}.${exchange}.${routingKey}`);

    const handlers = {};

    const getHandler = ctx => {
        if (!ctx.ut.method) return;
        const handler = handlers[ctx.ut.method];
        if (!handler && methods === true) return setHandler(ctx.ut.method);
        return handler;
    };

    const setHandler = (method, config = {}) => {
        const tokens = method.split('.').slice(-2);
        const {
            objectType = tokens[0],
            eventType = tokens[1],
            objectId = 'request.msg.id',
            data
        } = config;
        const handler = handlers[method] = async ctx => {
            try {
                const payload = formatPayload(ctx, {
                    objectType,
                    eventType,
                    objectId,
                    data,
                    service,
                    method
                });

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
            Object.entries(methods).forEach(([method, config]) => setHandler(method, config));
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
