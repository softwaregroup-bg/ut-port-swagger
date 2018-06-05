const uuid = require('uuid');
module.exports = (port, method) => {
    return async (ctx, next) => {
        const { params, query } = ctx;
        const { body, files } = ctx.request;
        const trace = uuid.v4();
        if (port.log.trace) {
            port.log.trace({ $meta: { mtid: 'request', trace }, body, files, params, query });
        }
        return new Promise(resolve => {
            const msg = Object.assign({}, body, files, params, query);
            const $meta = {
                trace,
                mtid: 'request',
                method,
                reply: (response, $responseMeta) => {
                    switch ($responseMeta.mtid) {
                        case 'response':
                            ctx.body = response;
                            ctx.status = 200;
                            break;
                        case 'error':
                            ctx.status = (response.details && response.details.statusCode) || 400;
                            ctx.body = {
                                error: response
                            };
                            break;
                        default:
                            ctx.status = 400;
                            ctx.body = {
                                error: port.errors.swagger({
                                    cause: response
                                })
                            };
                            break;
                    }
                    return resolve(next());
                }
            };
            port.stream.push([msg, $meta]);
        });
    };
};
