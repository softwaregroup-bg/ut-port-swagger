module.exports = ({namespace, entity}) => {
    return {
        path: `/${entity}/{id}`,
        method: 'delete',
        spec: {
            'x-bus-method': `${namespace}.${entity}.remove`,
            operationId: `remove${entity}`,
            tags: [entity],
            description: `Remove ${entity}.`,
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
                    description: 'Record successfully deleted',
                    schema: {
                        type: 'object',
                        required: ['id'],
                        additionalProperties: false,
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
