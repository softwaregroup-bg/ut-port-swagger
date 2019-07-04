module.exports = ({port}) => {
    return (ctx, next) => {
        const {msg, $meta, successCode} = ctx.ut;
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
            port.stream.push([msg, $meta]);
        });
    };
};
