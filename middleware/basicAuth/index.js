const auth = require('basic-auth');
const compare = require('tsscmp');

module.exports = ({options: {identities, realm = 'Secure Area'}}) => {
    return async(ctx, next) => {
        const user = auth(ctx);
        const iLen = [].concat(identities).length;

        for (let i = 0; i < iLen; i++) {
            const opts = identities[i];
            if (user && (opts.name && compare(opts.name, user.name)) && (opts.pass && compare(opts.pass, user.pass))) {
                ctx.ut.$meta.basicAuth = {name: opts.name};
                return next();
            }
        }
        ctx.ut.$meta.basicAuth = false;
        throw new Error('authentication');
    };
};