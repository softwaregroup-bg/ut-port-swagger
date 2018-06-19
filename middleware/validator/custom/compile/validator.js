const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});
ajv.addKeyword('$file', {
    compile: schema => value => {
        const isFile = value && value.constructor.name === 'File';
        return schema === true ? isFile : !isFile;
    }
});

const getValidationHandler = schema => {
    // schema.$schema = 'http://json-schema.org/draft-07/schema';
    schema.$async = true;
    let isRequired = false;
    if (typeof schema.required === 'boolean') {
        isRequired = schema.required;
        delete schema.required;
    }
    const validate = ajv.compile(schema);
    return async value => {
        let error;
        if (isRequired && value === undefined) {
            error = {
                keyword: 'required',
                dataPath: '',
                schemaPath: '#/required',
                params: {
                    missingProperty: schema.name
                },
                message: `should have required property '${schema.name}'`
            };
        } else {
            try {
                await validate(value);
            } catch (e) {
                error = e;
            }
        }
        return error;
    };
};
const collectionFormats = {
    csv: ',',
    ssv: ' ',
    tsv: '\t',
    pipes: '|'
};

module.exports = {
    empty: () => {
        return getValidationHandler({
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
    },
    file: schema => {
        return getValidationHandler({
            in: schema.in,
            name: schema.name,
            description: schema.description,
            required: schema.required,
            $file: true
        });
    },
    json: schema => {
        return getValidationHandler(schema);
    },
    primitive: schema => {
        const validate = getValidationHandler(schema);
        return async value => { // normalize value
            if (typeof value !== 'undefined') {
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
            }
            return await validate(value);
        };
    }
};
