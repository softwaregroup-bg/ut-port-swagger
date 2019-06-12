const definitions = require('./definitions');
const generateSchema = require('generate-schema');
const interpolationRegex = /^\$\{[\w]+(\.[\w]+)*\}$/g;
const interpolate = (schema, context) => {
    switch (typeof schema) {
        case 'string':
            if (interpolationRegex.test(schema)) {
                const tokens = schema.slice(2, -1).split('.');
                while (tokens.length) {
                    context = context[tokens.shift()];
                    if (!context) {
                        return schema;
                    }
                }
                return context;
            }
            return schema;
        case 'object':
            if (Array.isArray(schema)) {
                return schema.map(item => interpolate(item, context));
            } else {
                return Object.keys(schema).reduce((all, key) => {
                    all[key] = interpolate(schema[key], context);
                    return all;
                }, {});
            }
        default:
            return schema;
    }
};

const responseSchemaFormatter = {};
responseSchemaFormatter['2.0'] = (description, schema) => {
    return {
        description,
        schema
    };
};

responseSchemaFormatter['3.0.0'] =
responseSchemaFormatter['3.0.1'] = (description, schema) => {
    return {
        description,
        content: {
            'application/json': {
                schema
            }
        }
    };
};

module.exports = (port, {
    document,
    staticRoutesPrefix,
    namespace,
    schemas,
    context
}) => {
    const paths = {};
    const handlers = {};

    const getResponseSchema = responseSchemaFormatter[document.swagger || document.openapi];

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
                'x-bus-method': method,
                responses: {
                    default: getResponseSchema('Invalid request', definitions.error),
                    200: getResponseSchema('Record successfully obtained', schema)
                }
            }
        };
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.keys(data).forEach(key => contextRoutes(data[key], `${path}/${key}`));
        }
    };

    function schemasInventoryRoute() {
        const method = `${namespace}.schemas`;
        const {basePath = ''} = document;
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
                'x-bus-method': method,
                responses: {
                    default: getResponseSchema('Invalid request', definitions.error),
                    200: getResponseSchema('schemas definitions', {
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
                    'x-bus-method': method,
                    responses: {
                        default: getResponseSchema('Invalid request', definitions.error),
                        200: getResponseSchema(`${key} schema`, schemaSchema)
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
                'x-bus-method': method,
                responses: {
                    default: getResponseSchema('Invalid request', definitions.error),
                    200: getResponseSchema('Service is ready', {
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
                    503: getResponseSchema('Service is started but it is not ready yet', {
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

    const swaggerDocument = interpolate(document, context);
    Object.assign(swaggerDocument.paths, paths);

    return {swaggerDocument, handlers};
};
