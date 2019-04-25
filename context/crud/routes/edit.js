const removeRequired = obj => {
    if (obj.type === 'object') {
        delete obj.required;
        if (obj.properties) {
            obj.properties = {...obj.properties}; // don't override by reference
            for (let prop in obj.properties) {
                if (obj.properties.hasOwnProperty(prop)) {
                    obj.properties[prop] = {...obj.properties[prop]}; // don't override by reference
                    removeRequired(obj.properties[prop]);
                }
            }
        };
    }
};
module.exports = ({namespace, entity, schema}) => {
    const data = {...schema}; // don't override by reference
    removeRequired(data);
    return {
        path: `/${entity}`,
        method: 'patch',
        spec: {
            'x-bus-method': `${namespace}.${entity}.edit`,
            operationId: `edit${entity}`,
            tags: [entity],
            description: `Edit a ${entity}.`,
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
                        data
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
