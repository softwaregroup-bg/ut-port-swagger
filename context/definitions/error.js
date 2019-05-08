module.exports = {
    type: 'object',
    properties: {
        error: {
            type: 'object',
            properties: {
                type: {
                    type: 'string'
                },
                message: {
                    type: 'string'
                }
            },
            required: ['type', 'message'],
            additionalProperties: true
        }
    },
    required: ['error']
};
