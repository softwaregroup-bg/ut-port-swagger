const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});
ajv.addKeyword('file', {
    compile: schema => data => {
        if (schema) {
            if (data) {
                return data.constructor.name === 'File';
            } else {
                return false;
            }
        }
        return true;
    }
});
const getValidationHandler = schema => {
    schema.$async = true;
    return ajv.compile(schema);
};
const collectionFormats = {
    csv: ',',
    ssv: ' ',
    tsv: '\t',
    pipes: '|'
};

module.exports = {
    empty: () => {
        const validate = getValidationHandler({
            // $schema: 'http://json-schema.org/draft-04/schema#',
            oneOf: [
                {
                    type: 'null'
                },
                {
                    type: 'string',
                    maxLength: 0
                },
                {
                    type: 'object',
                    additionalProperties: false,
                    properties: {}
                }
            ]
        });
        return async v => await validate(v);
    },
    file: schema => {
        const validate = getValidationHandler({
            in: schema.in,
            name: schema.name,
            description: schema.description,
            type: 'object',
            file: schema.required
        });
        return async v => await validate(v);
    },
    json: schema => {
        const validate = getValidationHandler(schema);
        return async v => await validate(v);
    },
    primitive: schema => {
        const validate = getValidationHandler(schema);
        return async value => {
            if (value === undefined && schema.required) {
                throw new Error('value is required!');
            }
            switch (schema.type) {
                case 'number':
                case 'integer':
                    if (!isNaN(value)) {
                        value = +value;
                    }
                    break;
                case 'boolean':
                    if (value === 'true') {
                        value = true;
                    } else if (value === 'false') {
                        value = false;
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        const format = collectionFormats[schema.collectionFormat || 'csv'];
                        value = format ? String(value).split(format) : [value];
                    }
                    switch (schema.items.type) {
                        case 'number':
                        case 'integer':
                            value = value.map(v => isNaN(v) ? v : +v);
                            break;
                        case 'boolean':
                            value = value.map(v => v === 'true' ? true : v === 'false' ? false : v);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            return await validate(value);
        };
    }
};
