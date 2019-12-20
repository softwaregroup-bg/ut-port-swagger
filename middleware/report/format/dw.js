const dotProp = require('dot-prop');
module.exports = (ctx, {
    objectType,
    eventType,
    objectId,
    data,
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
    const context = {request: ctx.ut, response: ctx.body};
    return {
        tenantId,
        objectId: dotProp.get(context, objectId, objectId),
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
        data: {
            ...data && Object
                .entries(data)
                .reduce((props, [key, value]) => {
                    props[key] = dotProp.get(context, value, value);
                    return props;
                }, {}),
            ...ctx.ut.msg
        },
        messageAddedDate: Date.now()
    };
};
