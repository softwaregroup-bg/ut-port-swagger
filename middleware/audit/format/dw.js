const os = require('os');
const serverMachineName = os.hostname();
const serverOsVersion = [os.type(), os.platform(), os.release()].join(':');
module.exports = (port, ctx, error) => {
    const {
        sessionId = null,
        businessUnitId = null,
        businessUnitName = null,
        userId = null,
        username: userName = null
    } = ctx.ut.$meta.auth;

    return {
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
        eventGUIDDateTime: Date.now() / 1000 | 0, // unix timestamp
        eventClass: port.config.id,
        eventCode: ctx.ut.method,
        eventURI: ctx.url,
        eventDescription: ctx.ut.method,
        controllerName: ctx.ut.method.split('.')[0],
        controllerVersion: port.bus.config.version,
        channel: 'web',
        userId,
        userName,
        businessUnitName,
        businessUnitId,
        severityLevel: null,
        sessionId,
        sourceIpAddress: ctx.req.socket.remoteAddress,
        destinationIpAddress: ctx.req.socket.localAddress,
        destinationPort: ctx.req.socket.localPort,
        geolocation: null,
        serverOsVersion,
        domainName: ctx.headers['x-forwarded-host']
            ? ctx.headers['x-forwarded-host'].split(',')[0]
            : ctx.hostname,
        serverMachineName,
        deviceId: null
    };
};
