const auth = require('basic-auth');
const compare = require('tsscmp');

module.exports = ({options: {identities, realm = 'Secure Area'}}) => {
    return async(ctx, next) => {
        const {ut: {security, securityCheck, securityCheckState}} = ctx;
        if (!security.length || securityCheck(securityCheckState)) {
            return next();
        }
        // check if basicAuth is enabled for this method
        if (security.indexOf('basicAuth') === -1) {
            return next();
        }
        const user = auth(ctx);
        // when identities is function it gets called
        // this is very useful when you want to call some external identity check.
        if (typeof identities === 'function') {
            try {
                await identities(user);
                ctx.ut.$meta.basicAuth = {name: user.name};
                ctx.ut.securityCheckState.basicAuth = true;
                return next();
            } catch (e) {
                ctx.ut.$meta.basicAuth = false;
                ctx.ut.securityCheckState.basicAuth = false;
                return next();
            }
        }
        const iLen = [].concat(identities).length;

        for (let i = 0; i < iLen; i++) {
            const opts = identities[i];
            if (user && (opts.name && compare(opts.name, user.name)) && (opts.pass && compare(opts.pass, user.pass))) {
                ctx.ut.$meta.basicAuth = {name: user.name};
                ctx.ut.securityCheckState.basicAuth = true;
                return next();
            }
        }
        ctx.ut.$meta.basicAuth = false;
        ctx.ut.securityCheckState.basicAuth = false;
        return next();
    };
};
