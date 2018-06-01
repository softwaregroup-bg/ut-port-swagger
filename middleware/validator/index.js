const swagger2 = require('swagger2');
module.exports = (port, swaggerDocument) => {
    const compiled = swagger2.compileDocument(swaggerDocument);
    return async (ctx, next) => {
        if (!ctx.path.startsWith(swaggerDocument.basePath)) {
            return next();
        }
        let compiledPath = compiled(ctx.path);
        if (compiledPath === undefined) {
            // if there is no single matching path, return 404 (not found)
            ctx.status = 404;
            return;
        }
        let errors = swagger2.validateRequest(compiledPath, ctx.method, ctx.request.query, ctx.request.body);
        if (errors === undefined) {
            // operation not defined, return 405 (method not allowed)
            ctx.status = 405;
            return;
        }

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = port.errors['swagger.requestValidation']({errors});
            return;
        }

        await next();

        errors = swagger2.validateResponse(compiledPath, ctx.method, ctx.status, ctx.body);
        if (errors) {
            ctx.status = 500;
            ctx.body = port.errors['swagger.responseValidation']({errors});
        }
    };
};
