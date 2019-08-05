const definitions = require('./definitions');
const generateSchema = require('generate-schema');

const responseSchemaFormatter = {
    '2.0': (description, schema) => {
        return {
            description,
            schema
        };
    },
    '3.0.0': (description, schema) => {
        return {
            description,
            content: {
                'application/json': {
                    schema
                }
            }
        };
    }
};

responseSchemaFormatter['3.0.1'] = responseSchemaFormatter['3.0.0'];

module.exports = (port, {
    swaggerDocument,
    staticRoutesPrefix,
    namespace,
    schemas,
    context
}) => {
    const paths = {};
    const handlers = {};

    const formatResponse = responseSchemaFormatter[swaggerDocument.swagger || swaggerDocument.openapi];

    function getPath(path) {
        return staticRoutesPrefix ? `${staticRoutesPrefix}${path}` : path;
    }

    function contextRoutes(data = context, path = '/context') {
        const tokens = [namespace].concat(path.split('/').filter(x => x));
        const method = tokens.join('.');
        const schema = generateSchema.json(tokens.join(' '), data);
        // delete $schema property as it is in conflict with swagger 2 specification
        delete schema.$schema;

        handlers[method] = () => ({response: data});
        paths[getPath(path)] = {
            get: {
                operationId: method,
                tags: ['metadata'],
                description: method,
                responses: {
                    default: formatResponse('Invalid request', definitions.error),
                    200: formatResponse('Record successfully obtained', schema)
                }
            }
        };
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.keys(data).forEach(key => contextRoutes(data[key], `${path}/${key}`));
        }
    };

    function schemasInventoryRoute() {
        const method = `${namespace}.schemas`;
        const {basePath = ''} = swaggerDocument;
        handlers[method] = () => {
            return {
                response: Object.keys(schemas).reduce((all, key) => {
                    all[key] = basePath + getPath(`/schemas/${key}`);
                    return all;
                }, {})
            };
        };
        paths[getPath('/schemas')] = {
            get: {
                operationId: method,
                tags: ['metadata'],
                description: method,
                responses: {
                    default: formatResponse('Invalid request', definitions.error),
                    200: formatResponse('schemas definitions', {
                        type: 'object',
                        properties: {},
                        additionalProperties: true
                    })
                }
            }
        };
    }

    function schemasRoutes() {
        Object.entries(schemas).forEach(([key, schema]) => {
            const method = `${namespace}.schemas.${key}`;
            const schemaSchema = generateSchema.json(`schema ${key}`, schema);
            // delete $schema property as it is in conflict with swagger 2 specification
            delete schemaSchema.$schema;
            handlers[method] = () => ({response: schema});
            paths[getPath(`/schemas/${key}`)] = {
                get: {
                    operationId: method,
                    tags: ['metadata'],
                    description: method,
                    responses: {
                        default: formatResponse('Invalid request', definitions.error),
                        200: formatResponse(`${key} schema`, schemaSchema)
                    }
                }
            };
        });
    }

    function healthRoute() {
        const method = `${namespace}.health`;
        handlers[method] = () => ({
            status: port.isReady ? 200 : 503,
            response: {
                state: port.state
            }
        });
        paths[getPath('/healthz')] = {
            get: {
                operationId: method,
                tags: ['metadata'],
                description: method,
                responses: {
                    default: formatResponse('Invalid request', definitions.error),
                    200: formatResponse('Service is ready', {
                        type: 'object',
                        required: ['state'],
                        properties: {
                            state: {
                                type: 'string',
                                title: 'state'
                            }
                        },
                        additionalProperties: false
                    }),
                    503: formatResponse('Service is started but it is not ready yet', {
                        type: 'object',
                        properties: {
                            state: {
                                type: 'string'
                            }
                        },
                        additionalProperties: false
                    })
                }
            }
        };
    }

    contextRoutes();
    schemasInventoryRoute();
    schemasRoutes();
    healthRoute();

    return {handlers, paths};
};
