module.exports = ({namespace, entity, schema}) => {
    return {
        path: `/${entity}/search`,
        method: 'post',
        spec: {
            'x-bus-method': `${namespace}.${entity}.fetch`,
            operationId: `fetch${entity}`,
            tags: [entity],
            description: `Search for ${entity} by specific criteria.`,
            parameters: [{
                name: 'body',
                in: 'body',
                description: 'body',
                required: true,
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        criteria: {
                            type: 'object',
                            description: 'Search criteria'
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                pageNumber: {
                                    type: 'integer',
                                    minimum: 0
                                },
                                pageSize: {
                                    example: 10,
                                    minimum: 1,
                                    type: 'integer'
                                }
                            }
                        }
                    }
                }
            }],
            responses: {
                default: {
                    description: 'Invalid request.',
                    schema: {
                        $ref: '#/definitions/error'
                    }
                },
                200: {
                    description: 'Records successfully obtained',
                    schema: {
                        type: 'object',
                        required: ['records', 'pagination'],
                        properties: {
                            records: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            $ref: '#/definitions/uuid'
                                        },
                                        data: schema
                                    }
                                }
                            },
                            pagination: {
                                type: 'object',
                                required: [
                                    'pageNumber',
                                    'pageSize',
                                    'totalPages',
                                    'totalElements'
                                ],
                                properties: {
                                    pageNumber: {
                                        type: 'integer'
                                    },
                                    pageSize: {
                                        type: 'integer',
                                        minimum: 1
                                    },
                                    totalPages: {
                                        type: 'integer'
                                    },
                                    totalElements: {
                                        type: 'integer'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
};
