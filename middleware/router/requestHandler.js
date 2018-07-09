const uuid = require('uuid');
module.exports = ({port, method, successCode}) => {
    return async (ctx, next) => {
        const { params, query } = ctx;
        const { body, files } = ctx.request;
        const trace = uuid.v4();
        if (port.log.trace) {
            port.log.trace({ $meta: { mtid: 'request', trace }, body, files, params, query });
        }
        return new Promise((resolve, reject) => {
            const msg = Object.assign({}, body, files, params, query);
            const $meta = {
                trace,
                mtid: 'request',
                method,
                requestHeaders: ctx.request.headers,
                reply: (response, $responseMeta) => {
                    switch ($responseMeta.mtid) {
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
                }
            };
            port.stream.push([msg, $meta]);
        });
    };
};
