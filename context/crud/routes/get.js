module.exports = ({namespace, entity, schema}) => {
    return {
        path: `/${entity}/{id}`,
        method: 'get',
        spec: {
            'x-bus-method': `${namespace}.${entity}.get`,
            operationId: `get${entity}`,
            tags: [entity],
            description: `Get a ${entity}.`,
            parameters: [{
                name: 'id',
                in: 'path',
                description: 'id',
                required: true,
                $ref: '#/definitions/uuid'
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
                        properties: {
                            id: {
                                $ref: '#/definitions/uuid'
                            },
                            data: schema
                        }
                    }
                }
            }
        }
    };
};
