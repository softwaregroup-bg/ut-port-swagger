const uuid = require('uuid');
module.exports = ({port}) => {
    return (ctx, next) => {
        const { params, query, path } = ctx;
        const { body, files, headers } = ctx.request;
        const { method, successCode } = ctx.ut;
        const mtid = 'request';
        const trace = uuid.v4();
        const message = ctx.ut.msg = Object.assign({}, Array.isArray(body) ? {list: body} : body, files, params, query);
        const $meta = ctx.ut.$meta = { mtid, trace, method, headers };
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
                        ctx.body = {
                            error: response
                        };
                        return reject(response);
                    default:
                        ctx.status = 400;
                        const error = port.errors.swagger({
                            cause: response
                        });
                        ctx.body = {error};
                        return reject(error);
                }
            };
            port.stream.push([message, $meta]);
        });
    };
};
