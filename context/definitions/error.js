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
                },
                debug: {
                    type: 'object',
                    required: ['stack'],
                    properties: {
                        stack: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                }
            },
            required: ['type', 'message'],
            additionalProperties: true
        }
    },
    required: ['error']
};
