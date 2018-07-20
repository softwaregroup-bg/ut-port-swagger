
const compile = require('./compile');
module.exports = async ({port, swaggerDocument, options}) => {
    const compiled = await compile(swaggerDocument);
    return async (ctx, next) => {
        if (!ctx.path.startsWith(swaggerDocument.basePath)) {
            return next();
        }
        const validate = compiled.getValidator(ctx.path, ctx.method);
        if (!validate) {
            ctx.status = 404;
            throw port.errors['swagger.requestValidation']();
        }
        let errors = [];
        if (options.request) {
            errors = await validate.request({
                query: ctx.request.query,
                body: ctx.request.body,
                files: ctx.request.files,
                headers: ctx.request.headers,
                pathParameters: ctx.params
            });
            if (errors.length > 0) {
                ctx.status = 400;
                let error = port.errors['swagger.requestValidation']({errors});
                ctx.body = {error};
                throw error;
            }
        }

        await next();

        if (options.response) {
            errors = await validate.response({
                status: ctx.status,
                body: ctx.body
            });
            if (errors.length > 0) {
                ctx.status = 500;
                let error = port.errors['swagger.responseValidation']({errors});
                ctx.body = {error};
                throw error;
            }
        }
    };
};
