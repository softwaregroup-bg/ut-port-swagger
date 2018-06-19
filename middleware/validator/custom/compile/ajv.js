const Ajv = require('ajv');
class UtAjv extends Ajv {
    constructor(options) {
        super(options);
        this.addKeyword('$file', {
            compile: schema => value => {
                const isFile = value && value.constructor.name === 'File';
                return schema === true ? isFile : !isFile;
            }
        });
        this.addKeyword('$required', {
            compile: schema => value => {
                return schema === true ? typeof value !== 'undefined' : false;
            }
        });
    }
}

module.exports = UtAjv;
