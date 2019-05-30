const conditionalGet = require('koa-conditional-get');
module.exports = ({options}) => {
    return conditionalGet(options);
};
