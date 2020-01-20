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
            const payloads = [].concat(formatPayload(port, ctx, error));

            for (let i = 0, n = payloads.length; i < n; i += 1) {
                await sendToQueue({
                    payload: payloads[i],
                    options,
                    exchange,
                    routingKey
                });
            }
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
