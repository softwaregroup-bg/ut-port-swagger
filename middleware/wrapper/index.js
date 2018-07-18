module.exports = () => {
    return async (ctx, next) => {
        // request
        try {
            await next();
            // response
        } catch (e) {
            // error
            ctx.app.emit('error', e, ctx);
        }
    };
};
