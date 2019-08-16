const os = require('os');
const destinationMachineName = os.hostname();
const serverOs = [os.type(), os.platform(), os.release()].join(':');
const uuid = require('uuid').v4;
module.exports = (port, ctx, error) => {
    const {
        sessionId = null,
        businessUnitId = null,
        businessUnitName = null,
        userId = null,
        username: userName = null,
        tenantId = null,
        tenantName = null
    } = ctx.ut.$meta.auth;

    return {
        auditEntryId: null,
        success: !error,
        errorMessage: error ? error.message : null,
        errorCode: error ? (error.type || error.code || error.name) : null,
        affectedObjects: [
            {
                objectId: null,
                objectType: null
            }
        ],
        callParams: ctx.ut.msg,
        traceUUID: ctx.ut.$meta.trace,
        eventUUID: uuid(),
        eventKey: ctx.ut.$meta.method,
        eventURI: ctx.url,
        eventDate: Date.now() / 1000 | 0, // unix timestamp
        eventDescription: ctx.ut.method,
        serviceName: ctx.ut.method.split('.')[0], // to do
        serviceVersion: port.bus.config.version, // to do
        channel: 'web',
        userId,
        userName,
        businessUnitName,
        businessUnitId,
        severityLevel: null,
        sessionId,
        sourceIp: ctx.req.socket.remoteAddress,
        destinationIp: ctx.req.socket.localAddress,
        destinationPort: ctx.req.socket.localPort,
        geolocation: null,
        serverOs,
        destinationHostName: ctx.headers['x-forwarded-host']
            ? ctx.headers['x-forwarded-host'].split(',')[0]
            : ctx.hostname,
        destinationMachineName,
        userDeviceId: null,
        tenantId,
        tenantName,
        eventMappingPath: null,
        eventMappingVia: null
    };
};
