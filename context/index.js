const crud = require('./crud');
const definitions = require('./definitions');
const generateSchema = require('generate-schema');
const interpolationRegex = /^\$\{[\w]+(\.[\w]+)*\}$/g;
const interpolate = (schema, content) => {
    switch (typeof schema) {
        case 'string':
            if (interpolationRegex.test(schema)) {
                const tokens = schema.slice(2, -1).split('.');
                while (tokens.length) {
                    content = content[tokens.shift()];
                    if (!content) {
                        return schema;
                    }
                }
                return content;
            }
            return schema;
        case 'object':
            if (Array.isArray(schema)) {
                return schema.map(item => interpolate(item, content));
            } else {
                return Object.keys(schema).reduce((all, key) => {
                    all[key] = interpolate(schema[key], content);
                    return all;
                }, {});
            }
        default:
            return schema;
    }
};

module.exports = (port, {
    document,
    prefix = '/meta',
    namespace,
    schemas,
    content
}) => {
    const paths = {};
    const handlers = {};

    function getPath(path) {
        return prefix ? `${prefix}${path}` : path;
    }

    function contentRoutes(data = content, path = '/content') {
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
                    default: {
                        description: 'Invalid request.',
                        schema: definitions.error
                    },
                    200: {
                        description: 'Record successfully obtained',
                        schema
                    }
                }
            }
        };
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.keys(data).forEach(key => contentRoutes(data[key], `${path}/${key}`));
        }
    };

    function schemasInventoryRoute() {
        const method = `${namespace}.schemas`;
        handlers[method] = () => ({
            response: Object.keys(schemas).reduce((all, key) => {
                all[key] = getPath(`/schemas/${key}`);
                return all;
            }, {})
        });
        paths[getPath('/schemas')] = {
            get: {
                operationId: method,
                tags: ['metadata'],
                description: method,
                'x-bus-method': method,
                responses: {
                    default: {
                        description: 'Invalid request.',
                        schema: definitions.error
                    },
                    200: {
                        description: 'schemas definitions',
                        schema: {
                            type: 'object',
                            properties: {},
                            additionalProperties: true
                        }
                    }
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
                        default: {
                            description: 'Invalid request.',
                            schema: definitions.error
                        },
                        200: {
                            description: `${key} schema`,
                            schema: schemaSchema
                        }
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
                    default: {
                        description: 'Invalid request.',
                        schema: definitions.error
                    },
                    200: {
                        description: 'Service is ready',
                        schema: {
                            type: 'object',
                            properties: {
                                state: {
                                    type: 'string'
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    503: {
                        description: 'Service is started but it is not ready yet',
                        schema: {
                            type: 'object',
                            properties: {
                                state: {
                                    type: 'string'
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            }
        };
    }

    contentRoutes();
    schemasInventoryRoute();
    schemasRoutes();
    healthRoute();

    const swaggerDocument = interpolate(document, content);
    Object.assign(swaggerDocument.paths, paths);

    return {swaggerDocument, handlers};
};
