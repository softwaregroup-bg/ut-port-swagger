const jwt = require('koa-jwt');
const koaCompose = require('koa-compose');
module.exports = ({options}) => {
    const { key = 'user' } = options;
    return koaCompose([
        jwt(options).unless({
            custom: ctx => typeof ctx.ut.method === 'undefined'
        }),
        (ctx, next) => {
            ctx.ut.$meta.auth = ctx.state[key];
            return next();
        }
    ]);
};
