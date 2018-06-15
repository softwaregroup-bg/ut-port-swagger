const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

const collectionFormats = {
    csv: ',',
    ssv: ' ',
    tsv: '\t',
    pipes: '|'
};

module.exports = {
    empty: () => {
        return v => {
            if (v === undefined || v === null || v === '' || Object.keys(v).length === 0) {
                return Promise.resolve(true);
            };
            return Promise.reject(new Error('value not empty'));
        };
    },
    json: schema => {
        schema.$async = true;
        const validate = ajv.compile(schema);
        return async v => {
            return await validate(v);
        };
    },
    primitive: schema => {
        schema.$async = true;
        const validate = ajv.compile(schema);
        return async value => {
            if (value === undefined && schema.required) {
                throw new Error('value is required!');
            }
            switch (schema.type) {
                case 'number':
                case 'integer':
                    if (!isNaN(value)) {
                        // if the value is a number, make sure it's a number
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
