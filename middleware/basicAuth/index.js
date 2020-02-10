const basicAuth = require('koa-basic-auth');
module.exports = ({options}) => {
    return (Array.isArray(options) && options.map((o) => basicAuth(o))) || basicAuth(options);
};
