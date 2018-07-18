const jwt = require('koa-jwt');
module.exports = ({options}) => {
    return jwt(options);
};
