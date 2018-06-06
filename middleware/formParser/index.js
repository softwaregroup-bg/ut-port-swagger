const koaFormidable = require('koa2-formidable');
module.exports = ({options}) => {
    return koaFormidable(options);
};
