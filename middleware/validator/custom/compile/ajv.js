const Ajv = require('ajv');
class UtAjv extends Ajv {
    constructor(options) {
        super(options);
        this.addKeyword('x-file', {
            compile: schema => value => {
                const isFile = value && value.constructor.name === 'File';
                return schema === true ? isFile : !isFile;
            },
            metaSchema: {
                description: 'x-file',
                type: 'boolean'
            }
        });
        this.addKeyword('x-required', {
            compile: schema => value => {
                return schema === true ? typeof value !== 'undefined' : true;
            },
            metaSchema: {
                description: 'x-required',
                type: 'boolean'
            }
        });
        this.addKeyword('x-occurrences', {
            type: 'array',
            compile: schema => value => {
                if (value.length === 0) {
                    // array should not be empty as long as there are x-occurrences rules
                    return false;
                }
                return schema
                    .map(rule => {
                        // indices of records which don't have a key equal to rule.key
                        const indicesWithMissingKey = [];
                        const count = value.map((record, i) => {
                            if (!record.hasOwnProperty(rule.key)) {
                                indicesWithMissingKey.push(i);
                            }
                            return record[rule.key] === rule.value;
                        }).filter(x => x).length;
                        if (indicesWithMissingKey.length !== 0) {
                            return false;
                        }
                        return rule.min <= count && count <= rule.max;
                    })
                    .filter(x => x)
                    .length === schema.length;
            },
            metaSchema: {
                type: 'array',
                minItems: 1,
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
                            description: 'max',
                            type: 'integer',
                            minimum: {
                                '$data': '1/min'
                            }
                        }
                    }
                }
            }
        });
    }
}

module.exports = UtAjv;
