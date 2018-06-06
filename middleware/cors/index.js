const koaCors = require('koa-cors');
module.exports = ({options}) => {
    return koaCors(options);
};
