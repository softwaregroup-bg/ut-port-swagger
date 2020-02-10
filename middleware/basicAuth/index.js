const basicAuth = require('koa-basic-auth');
module.exports = ({options}) => {
    return basicAuth(options);
};
