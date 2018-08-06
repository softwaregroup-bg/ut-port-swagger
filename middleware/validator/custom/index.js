
const compile = require('./compile');
module.exports = async ({port, options}) => {
    const compiled = await compile(port.swaggerDocument);
    return async (ctx, next) => {
        if (!ctx.path.startsWith(port.swaggerDocument.basePath)) {
            return next();
        }
        const validate = compiled.getValidator(ctx.path, ctx.method);
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
