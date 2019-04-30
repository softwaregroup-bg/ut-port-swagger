module.exports = ({port, options}) => {
    const {handlers} = options;
    return (ctx, next) => {
        const { method, successCode } = ctx.ut;
        if (handlers[method]) {
            const { params, query, path } = ctx;
            const { body } = ctx.request;
            const { method } = ctx.ut;
            port.log.trace && port.log.trace({
                body,
                params,
                query,
                path,
                $meta: { mtid: 'request', method }
            });
            try {
                const {
                    response,
                    status = successCode
                } = handlers[method]({...body, ...params, ...query});
                ctx.body = response;
                ctx.status = status;
                port.log.trace && port.log.trace({
                    response,
                    status,
                    $meta: { mtid: 'response', method }
                });
            } catch (e) {
                const error = port.errors['swagger.contextProviderError'](e);
                ctx.status = 400;
                ctx.body = {error};
                port.log.error && port.log.error({
                    error,
                    status: ctx.status,
                    $meta: { mtid: 'error', method }
                });
                throw error;
            }
        } else {
            return next();
        }
    };
};
