const dotProp = require('dot-prop');
module.exports = (ctx, {
    objectType,
    eventType,
    objectId,
    service
}) => {
    const {
        userId = null,
        name = null,
        username = null,
        businessUnitId = null,
        businessUnitName = null,
        tenantId = null
    } = ctx.ut.$meta.auth || {};

    return {
        tenantId,
        objectId: dotProp.get({request: ctx.ut, response: ctx.body}, objectId),
        service,
        eventType,
        objectType,
        user: {
            userId,
            name,
            username,
            businessUnitId,
            businessUnitName
        },
        data: ctx.ut.msg,
        messageAddedDate: Date.now() / 1000 | 0 // unix timestamp
    };
};
