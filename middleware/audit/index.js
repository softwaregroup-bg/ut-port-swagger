const os = require('os');
const serverMachineName = os.hostname();
const serverOsVersion = [os.type(), os.platform(), os.release()].join(':');

const getAuditHandler = (port, { namespace, exchange, routingKey, options }) => {
    if (!namespace) throw new Error('audit namespace is required');

    if (typeof namespace !== 'string') throw new Error('audit namespace must be a string');

    if (!exchange) throw new Error('audit exchange is required');

    if (typeof exchange !== 'string') throw new Error('audit exchange must be a string');

    if (!routingKey) throw new Error('audit routingKey is required');

    if (typeof routingKey !== 'string') throw new Error('audit routingKey must be a string');

    const method = `${namespace}.${exchange}.${routingKey}`;

    return async(ctx, error) => {
        if (!ctx.ut.method) return; // audit bus methods only

        const payload = {
            auditEntryId: null,
            dateAndTime: null,
            success: !error,
            failureReason: error ? error.message : null,
            failureCode: error ? (error.type || error.code || error.name) : null,
            relatedObjects: [
                {
                    objectId: null,
                    objectType: null
                }
            ],
            callParams: ctx.ut.msg,
            eventGUID: ctx.ut.$meta.trace,
            eventGUIDDateTime: Date.now(),
            eventClass: port.config.id,
            eventCode: ctx.ut.method,
            eventURI: ctx.url,
            eventDescription: ctx.ut.method,
            controllerName: ctx.ut.method.split('.')[0],
            controllerVersion: '0.0.1',
            channel: 'web',
            userId: null,
            userName: 'anonymousUser',
            businessUnitName: null,
            businessUnitId: null,
            severityLevel: null,
            sessionId: null,
            sourceIpAddress: '0:0:0:0:0:0:0:1',
            destinationIpAddress: '0:0:0:0:0:0:0:1',
            destinationPort: ctx.req.socket.localPort,
            geolocation: null,
            serverOsVersion,
            domainName: ctx.headers['x-forwarded-host']
                ? ctx.headers['x-forwarded-host'].split(',')[0]
                : ctx.hostname,
            serverMachineName,
            deviceId: null
        };

        try {
            await port.bus.importMethod(method)({
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
