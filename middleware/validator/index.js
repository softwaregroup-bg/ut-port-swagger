const parsers = {
    '2.0': require('./2.0'),
    '3.0.0': require('./3.0.0'),
    '3.0.1': require('./3.0.1')
};
module.exports = async({port, options}) => {
    const {swaggerDocument} = port;
    const version = swaggerDocument.swagger || swaggerDocument.openapi;
    const parse = parsers[version];
    if (!parse) {
        throw new Error(`Open api version ${version} not supported`);
    }
    const validator = await parse(swaggerDocument);
    return async(ctx, next) => {
        const validate = validator(ctx.path, ctx.method);
        if (!validate) {
            ctx.status = 404;
            const error = port.errors['swagger.validationNotFound']();
            ctx.body = {error};
            throw error;
        }
        if (options.request) {
            const errors = await validate.request({
                query: ctx.request.query,
                body: ctx.request.body,
                files: ctx.request.files,
                headers: ctx.request.headers,
                pathParameters: ctx.params
            });
            if (errors.length > 0) {
                ctx.status = 400;
                const error = port.errors['swagger.requestValidation']({errors});
                ctx.body = {error};
                throw error;
            }
        }

        await next();

        if (options.response) {
            const errors = await validate.response({
                status: ctx.status,
                body: ctx.body
            });
            if (errors.length > 0) {
                ctx.status = 500;
                const error = port.errors['swagger.responseValidation']({errors});
                ctx.body = {error};
                throw error;
            }
        }
    };
};
