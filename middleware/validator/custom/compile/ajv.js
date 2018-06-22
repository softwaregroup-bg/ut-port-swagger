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
            errors: true,
            compile: originalSchema => {
                const errors = [];
                const schema = originalSchema.map(originalRule => {
                    // don't override rule by reference
                    const rule = Object.assign({}, originalRule);
                    if (rule.hasOwnProperty('pattern')) {
                        try {
                            rule.pattern = new RegExp(rule.pattern);
                        } catch (e) {
                            errors.push({
                                message: `pattern "${rule.pattern}" must be a valid javascript pattern`
                            });
                        }
                    }
                    return rule;
                });
                if (errors.length) {
                    const error = new Error('x-occurrences');
                    error.errors = errors;
                    throw error;
                }
                return function validate(value) {
                    const errors = [];
                    if (value.length === 0) {
                        errors.push('Array must not be empty');
                    } else {
                        for (let i = 0; i < schema.length; i += 1) {
                            const rule = schema[i];
                            const matches = [];
                            for (let j = 0; j < value.length; j += 1) {
                                const record = value[j];
                                if (!record.hasOwnProperty(rule.key)) {
                                    errors.push(`${rule.key} was not provided on index ${j}`);
                                    continue;
                                }
                                if (rule.pattern) {
                                    if (typeof record[rule.key] !== 'string') {
                                        errors.push(`The value of ${rule.key} on index ${j} must be a string matching the pattern ${rule.pattern}`);
                                        continue;
                                    }
                                    if (rule.pattern.test(record[rule.key])) {
                                        matches.push(j);
                                    } else {
                                        errors.push(`The value ${record[rule.key]} of ${rule.key} on index ${j} must be a string matching the pattern ${rule.pattern}`);
                                    }
                                } else {
                                    if (record[rule.key] === rule.value) {
                                        matches.push(j);
                                    } else {
                                        errors.push(`${rule.key} on index ${j} doesn't match the specified value`);
                                    }
                                }
                            }
                            if (matches.length < rule.min) {
                                errors.push(`Rule (min: ${rule.min}) violated! matches: ${matches.length}, key ${rule.key}`);
                            } else if (matches.length > rule.max) {
                                errors.push(`Rule (max: ${rule.max}) violated! matches: ${matches.length}, key ${rule.key}`);
                            }
                        }
                    }
                    if (errors.length !== 0) {
                        validate.errors = errors.map(message => {
                            return {
                                keyword: 'x-occurrences',
                                message,
                                params: {
                                    keyword: 'x-occurrences'
                                }
                            };
                        });
                        return false;
                    }
                    return true;
                };
            },
            metaSchema: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['key', 'min', 'max'],
                    additionalProperties: false,
                    maxProperties: 4,
                    properties: {
                        key: {
                            description: 'key',
                            type: 'string'
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
                        },
                        value: {
                            description: 'value'
                        },
                        pattern: {
                            description: 'pattern',
                            minLength: 1,
                            type: 'string'
                        }
                    }
                }
            }
        });
    }
}

module.exports = UtAjv;
