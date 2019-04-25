module.exports = ({namespace, entity, schema}) => {
    return {
        path: `/${entity}`,
        method: 'put',
        spec: {
            'x-bus-method': `${namespace}.${entity}.update`,
            operationId: `update${entity}`,
            tags: [entity],
            description: `Update a ${entity}.`,
            parameters: [{
                name: 'body',
                in: 'body',
                description: 'body',
                required: true,
                schema: {
                    type: 'object',
                    required: [
                        'id',
                        'data'
                    ],
                    properties: {
                        id: {
                            $ref: '#/definitions/uuid'
                        },
                        sync: {
                            $ref: '#/definitions/sync'
                        },
                        data: schema
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
                    description: 'Record successfully updated',
                    schema: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: {
                                $ref: '#/definitions/uuid'
                            }
                        }
                    }
                }
            }
        }
    };
};
