
module.exports = ({port, options: {errorFormat = 'ut'}}) => {
    const { errors } = port;
    const { debug = false } = port.config;
    return async(ctx, next) => {
        // request
        ctx.ut = {};
        try {
            await next();
            // response
        } catch (e) {
            // return error as is, without meta
            if (errorFormat === 'plain') {
                const {meta: {status} = {}, ...error} = e;
                ctx.status = status || 400;
                ctx.body = error;
                return ctx.app.emit('error', error, ctx);
            } else if (typeof (errorFormat) === 'function') {
                return errorFormat(e, ctx);
            }
            // ut error
            let error = e;
            if (!e.type || !errors.getError(e.type)) {
                if (debug) e.debug = {stack: e.stack.split('\n')};
                error = errors.swagger(e);
            }
            if (debug) error.debug = {stack: error.stack.split('\n')};
            ctx.body = { error };

            if (typeof e.status === 'number') ctx.status = e.status;
            else if (typeof e.statusCode === 'number') ctx.status = e.statusCode;

            if (!ctx.status || (ctx.status >= 200 && ctx.status < 300)) ctx.status = 400;
            ctx.app.emit('error', error, ctx);
        }
    };
};
