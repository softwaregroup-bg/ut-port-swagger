const defaultTransform = x => x;
const send = require('koa-send');
const url = require('url');
const { parse } = require('path');
module.exports = ({port, options}) => {
    const {
        authorize,
        transformRequest = defaultTransform,
        transformResponse = defaultTransform,
        transformErrorResponse = defaultTransform
    } = options;
    return async(ctx, next) => {
        if (ctx.ut.auth) ctx.ut.auth.verify();
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
        switch (typeof authorize) {
            case 'function':
                try {
                    const result = await authorize({message, $meta});
                    if (!result) {
                        ctx.status = 401;
                        throw port.errors['swagger.authorizationError']();
                    }
                    if (result.$meta) Object.assign($meta, result.$meta);
                } catch (e) {
                    ctx.status = 401;
                    throw port.errors['swagger.authorizationError'](e);
                }
                break;
            case 'string':
                await new Promise((resolve, reject) => {
                    port.stream.push([{message, $meta}, {
                        mtid: 'request',
                        method: authorize,
                        reply: (response, {mtid}) => {
                            switch (mtid) {
                                case 'response':
                                    if (!response) {
                                        ctx.status = 401;
                                        return reject(port.errors['swagger.authorizationError']());
                                    }
                                    if (response.$meta) Object.assign($meta, response.$meta);
                                    return resolve();
                                case 'error':
                                    ctx.status = 401;
                                    return reject(port.errors['swagger.authorizationError'](response));
                                default:
                                    ctx.status = 401;
                                    return reject(port.errors['swagger.authorizationError']({ cause: response }));
                            }
                        }
                    }]);
                });
                break;
            default:
                break;
        }
        return new Promise((resolve, reject) => {
            $meta.reply = async(response, $meta) => {
                try {
                    const {responseHeaders, cookies, mtid} = $meta;
                    if (responseHeaders) {
                        Object.keys(responseHeaders).forEach(header => {
                            ctx.set(header, responseHeaders[header]);
                        });
                    }

                    if (Array.isArray(cookies)) cookies.forEach(cookie => ctx.cookies.set(...cookie));

                    switch (mtid) {
                        case 'response':
                            if (typeof response === 'string') {
                                try {
                                    response = new URL(response);
                                } catch (e) {}
                            }
                            if (response instanceof URL) {
                                switch (response.protocol) {
                                    case 'file:': {
                                        const filePath = url.fileURLToPath(response);
                                        const options = {...$meta.options};
                                        if (!options.root) options.root = parse(filePath).root;
                                        await send(ctx, filePath, options);
                                    } break;
                                    default:
                                        throw port.errors['swagger.unsupportedUrlProtocol']({
                                            params: {
                                                protocol: response.protocol
                                            }
                                        });
                                }
                            } else {
                                ctx.body = transformResponse(response, $meta);
                                ctx.status = successCode;
                            }
                            break;
                        case 'error':
                            response = transformErrorResponse(response);
                            ctx.status = (response.details && response.details.statusCode) || 400;
                            if (response instanceof Error) throw response;
                            throw port.errors.swagger({
                                cause: response
                            });
                        default:
                            ctx.status = 400;
                            throw port.errors.swagger({
                                cause: response
                            });
                    }
                } catch (e) {
                    reject(e);
                }
                resolve(next);
            };
            port.stream.push([transformRequest(message, $meta), $meta]);
        });
    };
};
