const validator = require('./validator');
module.exports = {
    buildParams(path, methodName) {
        return []
            .concat(path.parameters)
            .concat(path[methodName].parameters)
            .filter(x => x)
            .map(param => {
                const schema = param.schema || param;
                if (['query', 'header', 'path'].indexOf(param.in) !== -1) {
                    param.validate = validator.primitive(schema);
                } else if (param.in === 'formData' && param.type === 'file') {
                    param.validate = validator.file(schema);
                } else {
                    param.validate = validator.json(schema);
                }
                return param;
            });
    },
    buildResponses(path, methodName) {
        return Object.keys(path[methodName].responses).reduce((all, res) => {
            const response = path[methodName].responses[res];
            all[res] = Object.assign({}, response, {
                validate: response.schema ? validator.json(response.schema) : validator.empty()
            });
            return all;
        }, {});
    },
    buildPathValidator(basePath, pathName, methodName) {
        const regExp = new RegExp(`^${basePath.replace(/\/*$/, '')}${pathName.replace(/\{[^}]*}/g, '[^/]+')}/?.${methodName}$`, 'i');
        return (path, method) => regExp.test(`${path}.${method}`);
    },
    async validate(value, validator) {
        let error;
        try {
            await validator.validate(value);
        } catch (e) {
            error = e;
        }
        return error;
    }
};
