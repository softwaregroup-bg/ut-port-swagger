const jwt = require('koa-jwt');
const koaCompose = require('koa-compose');
const { koaJwtSecret } = require('jwks-rsa');
module.exports = ({options}) => {
    const { key = 'user', jwks } = options;
    if (jwks) {
        options.secret = koaJwtSecret(jwks);
        delete options.jwks;
    }
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
