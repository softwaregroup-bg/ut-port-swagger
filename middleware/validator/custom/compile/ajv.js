const Ajv = require('ajv');
class UtAjv extends Ajv {
    constructor(options) {
        super(options);
        this.addKeyword('x-file', {
            compile: schema => value => {
                const isFile = value && value.constructor.name === 'File';
                return schema === true ? isFile : !isFile;
            }
        });
        this.addKeyword('x-required', {
            compile: schema => value => {
                return schema === true ? typeof value !== 'undefined' : false;
            }
        });
        this.addKeyword('x-occurrences', {
            type: 'array',
            compile: schema => value => {
                return schema
                    .map(rule => {
                        const count = (value || [])
                            .map(record => {
                                return record && record[rule.key] === rule.value;
                            })
                            .filter(x => x)
                            .length;
                        return rule.min <= count && count <= rule.max;
                    })
                    .filter(x => x)
                    .length === schema.length;
            },
            metaSchema: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['key', 'value', 'min', 'max'],
                    properties: {
                        key: {
                            description: 'key',
                            type: 'string'
                        },
                        value: {
                            description: 'value'
                        },
                        min: {
                            description: 'min',
                            type: 'integer',
                            minimum: 0
                        },
                        max: {
                            description: 'min',
                            type: 'integer',
                            minimum: 0
                        }
                    }
                }
            }
        });
    }
}

module.exports = UtAjv;
