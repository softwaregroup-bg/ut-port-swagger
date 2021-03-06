const swagger2 = require('swagger2');
module.exports = ({port, options}) => {
    const document = port.merge({}, port.swaggerDocument);
    const formFiles = {};
    Object.keys(document.paths).forEach(path => {
        Object.keys(document.paths[path]).forEach(method => {
            const spec = document.paths[path][method];
            if (spec.parameters) {
                const fileParams = [];
                spec.parameters = spec.parameters.filter(param => {
                    if (param.in === 'formData' && param.type === 'file') {
                        fileParams.push(param);
                        return false;
                    }
                    return true;
                });
                if (fileParams.length > 0) {
                    const fullPath = [document.basePath, path].filter(x => x).join('');
                    formFiles[`${fullPath}.${method.toLowerCase()}`] = fileParams;
                }
            }
        });
    });
    const compiled = swagger2.compileDocument(document);
    return async(ctx, next) => {
        if (!ctx.path.startsWith(document.basePath)) {
            return next();
        }
        const compiledPath = compiled(ctx.path);
        if (compiledPath === undefined) {
            // if there is no single matching path, return 404 (not found)
            ctx.status = 404;
            throw port.errors['swagger.validationNotFound']();
        }
        let errors = [];
        if (options.request) {
            errors = swagger2.validateRequest(compiledPath, ctx.method, ctx.request.query, ctx.request.body);
            if (errors === undefined) {
                // operation not defined, return 405 (method not allowed)
                ctx.status = 405;
                throw port.errors['swagger.methodNotAllowed']();
            }
            if (errors.length === 0) {
                const formFilesPath = `${ctx.path}.${ctx.method.toLowerCase()}`;
                if (formFiles[formFilesPath]) {
                    errors = formFiles[formFilesPath].reduce((all, param) => {
                        if (!ctx.request.files[param.name]) {
                            all.push({
                                expected: param
                            });
                        }
                        return all;
                    }, []);
                }
            }
            if (errors.length > 0) {
                ctx.status = 400;
                throw port.errors['swagger.requestValidation']({errors});
            }
        }

        await next();

        if (options.response) {
            errors = swagger2.validateResponse(compiledPath, ctx.method, ctx.status, ctx.body);
            if (errors) {
                ctx.status = 500;
                throw port.errors['swagger.responseValidation']({errors});
            }
        }
    };
};
