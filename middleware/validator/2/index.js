const swagger2 = require('swagger2');
const merge = require('lodash.merge');
module.exports = (port, swaggerDocument) => {
    let document = merge({}, swaggerDocument);
    let formFiles = {};
    Object.keys(document.paths).forEach(path => {
        Object.keys(document.paths[path]).forEach(method => {
            let spec = document.paths[path][method];
            if (spec.parameters) {
                let fileParams = [];
                spec.parameters = spec.parameters.filter(param => {
                    if (param.in === 'formData' && param.type === 'file') {
                        fileParams.push(param);
                        return false;
                    }
                    return true;
                });
                if (fileParams.length > 0) {
                    let fullPath = [document.basePath, path].filter(x => x).join('');
                    formFiles[`${fullPath}.${method.toLowerCase()}`] = fileParams;
                }
            }
        });
    });
    const compiled = swagger2.compileDocument(document);
    return async (ctx, next) => {
        if (!ctx.path.startsWith(document.basePath)) {
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
        if (errors.length === 0) {
            let formFilesPath = `${ctx.path}.${ctx.method.toLowerCase()}`;
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
