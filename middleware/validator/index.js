const validators = {};
validators['2.0'] = require('./custom');
// validators['2.0'] = require('./2');
validators['3.0.0'] = validators['3.0.1'] = require('./3');
module.exports = ({port, options}) => {
    const version = port.swaggerDocument.swagger || port.swaggerDocument.openapi;
    const validator = validators[version];
    if (!validator) {
        throw new Error(`Open api version ${version} not supported`);
    }
    return validator({port, options});
};
