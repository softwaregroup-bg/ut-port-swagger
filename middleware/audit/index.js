const formats = {
    dw: require('./format/dw')
};

const getAuditHandler = (port, {
    namespace,
    exchange,
    routingKey,
    options,
    format = 'dw'
}) => {
    const assertString = (key, value) => {
        if (!value || typeof value !== 'string') {
            throw new Error(`${port.config.id}.middleware.audit.${key} must be a string`);
        }
    };
    assertString('namespace', namespace);
    assertString('exchange', exchange);
    assertString('routingKey', routingKey);

    const formatPayload = typeof format === 'function' ? format : formats[format];

    if (typeof formatPayload !== 'function') throw new Error(`Unsupported audit format: ${format}`);

    const sendToQueue = port.bus.importMethod(`${namespace}.${exchange}.${routingKey}`);

    return async(ctx, error) => {
        if (!ctx.ut.method || !ctx.ut.$meta.auth) return; // audit bus methods only
        try {
            const payload = formatPayload(port, ctx, error);

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
};

module.exports = ({port, options}) => {
    const audit = getAuditHandler(port, options);

    return async(ctx, next) => {
        let error;
        try {
            await next();
        } catch (e) {
            error = e;
        }

        audit(ctx, error);

        if (error) throw error;
    };
};
