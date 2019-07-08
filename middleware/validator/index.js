const parsers = {};
parsers['2.0'] = require('ut-swagger2-validator');
// parsers['2.0'] = require('./2');
parsers['3.0.0'] = parsers['3.0.1'] = require('./3');
module.exports = async({port, options}) => {
    const {swaggerDocument} = port;
    const version = swaggerDocument.swagger || swaggerDocument.openapi;
    const parse = parsers[version];
    if (!parse) {
        throw new Error(`Open api version ${version} not supported`);
    }
    const validators = await parse(swaggerDocument);
    return async(ctx, next) => {
        const validate = validators[ctx.ut.method];
        if (!validate) {
            ctx.status = 404;
            throw port.errors['swagger.validationNotFound']();
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
                throw port.errors['swagger.requestValidation']({errors});
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
                throw port.errors['swagger.responseValidation']({errors});
            }
        }
    };
};
