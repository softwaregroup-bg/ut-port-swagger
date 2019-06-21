const os = require('os');
const serverMachineName = os.hostname();
const serverOsVersion = [os.type(), os.platform(), os.release()].join(':');
module.exports = ctx => {
    return {
        auditEntryId: null,
        dateAndTime: Date.now(),
        success: !(ctx.body && ctx.body.error),
        failureReason: null,
        failureCode: null,
        relatedObjects: [
            {
                objectId: null,
                objectType: null
            }
        ],
        callParams: ctx.ut.msg,
        eventGUID: ctx.ut.$meta.trace,
        eventGUIDDateTime: Date.now(),
        eventClass: ctx.ut.method,
        eventCode: ctx.ut.method,
        eventURI: ctx.url,
        eventDescription: 'Get loan product', // TODO
        controllerName: ctx.ut.method.split('.')[0],
        controllerVersion: '0.0.1', // TODO
        channel: 'web',
        userId: null,
        userName: 'anonymousUser',
        businessUnitName: null,
        businessUnitId: null,
        severityLevel: null,
        sessionId: '', // TODO 7345ECE6E5F47260E439D8CFD27EAD75
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
};
