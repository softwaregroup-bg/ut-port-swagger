const definitions = require('../definitions');
const routes = [
    require('./routes/add'),
    require('./routes/edit'),
    require('./routes/update'),
    require('./routes/fetch'),
    require('./routes/get'),
    require('./routes/remove')
];

/**
 * @param {string} namespace - The namespace of the service. E.g
 * @returns {function} - a crud factory function
 */
module.exports = ({namespace, models}) => {
    /**
     * @param {object} options - the documentation properties that are needed to create the swagger spec
     * @param {object} options.schemas - a key-value collection of primary object schemas
     * @param {string} options.basePath - api base path
     * @returns {object} - swagger document
     */
    return ({basePath = '/api'}) => {
        const swaggerDocument = {
            swagger: '2.0',
            info: {
                title: `${namespace} service api`,
                description: `API for interacting with ${namespace} data.`,
                version: '1.0'
            },
            produces: ['application/json'],
            basePath,
            definitions
        };
        swaggerDocument.paths = Object.keys(models).reduce((paths, entity) => {
            const schema = models[entity].schema || {};
            routes.forEach(route => {
                const {path, method, spec} = route({namespace, entity, schema});
                if (!paths[path]) {
                    paths[path] = {};
                } else if (paths[path][method]) {
                    throw new Error(`Method: ${method} is already defined for path: ${path}`);
                }
                paths[path][method] = spec;
            });
            return paths;
        }, {});
        return swaggerDocument;
    };
};
