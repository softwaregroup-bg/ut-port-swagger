const auth = require('basic-auth');
const compare = require('tsscmp');

module.exports = ({options: {identities, realm = 'Secure Area'}}) => {
    return async(ctx, next) => {
        const user = auth(ctx);
        // when identities is function it gets called
        // this is very useful when you want to call some external identity check.
        if (typeof identities === 'function') {
            await identities(user, ctx);
            ctx.ut.$meta.basicAuth = {name: user.name};
            return next();
        }
        const iLen = [].concat(identities).length;

        for (let i = 0; i < iLen; i++) {
            const opts = identities[i];
            if (user && (opts.name && compare(opts.name, user.name)) && (opts.pass && compare(opts.pass, user.pass))) {
                ctx.ut.$meta.basicAuth = {name: user.name};
                return next();
            }
        }
        ctx.ut.$meta.basicAuth = false;
        throw new Error('authentication');
    };
};
