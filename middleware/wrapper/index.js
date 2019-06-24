
const extractAuditData = require('./extractAuditData');
module.exports = ({port, options}) => {
    const {audit} = options;
    return async(ctx, next) => {
        // request
        ctx.ut = {};
        try {
            await next();
            // response
        } catch (e) {
            // error
            if (!ctx.body.error) ctx.body.error = e;
            if (port.config.debug) ctx.body.error.debug = {stack: e.stack.split('\n')};
            ctx.app.emit('error', e, ctx);
        }
        if (audit && ctx.ut.method) ctx.app.emit('audit', extractAuditData(port, ctx));
    };
};
