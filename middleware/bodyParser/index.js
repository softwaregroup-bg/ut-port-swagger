const koaBodyparser = require('koa-bodyparser');
module.exports = (options) => {
    return koaBodyparser(options);
};
