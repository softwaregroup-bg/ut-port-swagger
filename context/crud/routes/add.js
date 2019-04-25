module.exports = ({namespace, entity, schema}) => {
    return {
        path: `/${entity}`,
        method: 'post',
        spec: {
            'x-bus-method': `${namespace}.${entity}.add`,
            operationId: `add${entity}`,
            tags: [entity],
            description: `Creates a new ${entity}.`,
            parameters: [{
                name: 'body',
                in: 'body',
                description: 'body',
                required: true,
                schema: {
                    type: 'object',
                    required: [
                        'data'
                    ],
                    properties: {
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
                201: {
                    description: 'Record successfully created',
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
