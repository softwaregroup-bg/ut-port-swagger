
const compile = require('./compile');
module.exports = async ({port, swaggerDocument}) => {
    const compiled = await compile(swaggerDocument);
    return async (ctx, next) => {
        if (!ctx.path.startsWith(swaggerDocument.basePath)) {
            return next();
        }
        const validate = compiled.getValidator(ctx.path, ctx.method);
        if (!validate) {
            ctx.status = 404;
            return;
        }
        let errors = await validate.request({
            query: ctx.request.query,
            body: ctx.request.body,
            files: ctx.request.files,
            headers: ctx.request.headers,
            params: ctx.params
        });
        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = port.errors['swagger.requestValidation']({errors});
            return;
        }
        await next();
        errors = await validate.response({
            status: ctx.status,
            body: ctx.body
        });
        if (errors.length > 0) {
            ctx.status = 500;
            ctx.body = port.errors['swagger.responseValidation']({errors});
        }
    };
};
