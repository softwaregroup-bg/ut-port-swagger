module.exports = ({port}) => {
    return (ctx, next) => {
        const { $meta, successCode } = ctx.ut;
        const { params, query, path } = ctx;
        const { body, files } = ctx.request;
        const message = ctx.ut.msg = Object.assign(
            {},
            Array.isArray(body) ? {list: body} : body,
            files,
            params,
            query
        );
        if (port.log.trace) {
            port.log.trace({
                details: {
                    body,
                    files,
                    params,
                    query,
                    path
                },
                message,
                $meta
            });
        }
        return new Promise((resolve, reject) => {
            $meta.reply = (response, {responseHeaders, mtid}) => {
                if (responseHeaders) {
                    Object.keys(responseHeaders).forEach(header => {
                        ctx.set(header, responseHeaders[header]);
                    });
                }
                switch (mtid) {
                    case 'response':
                        ctx.body = response;
                        ctx.status = successCode;
                        return resolve(next());
                    case 'error':
                        ctx.status = (response.details && response.details.statusCode) || 400;
                        return reject(response);
                    default:
                        ctx.status = 400;
                        return reject(port.errors.swagger({
                            cause: response
                        }));
                }
            };
            port.stream.push([message, $meta]);
        });
    };
};
