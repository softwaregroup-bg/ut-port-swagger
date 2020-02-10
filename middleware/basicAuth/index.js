const auth = require('basic-auth');
const compare = require('tsscmp');

module.exports = ({options: {identities, realm = 'Secure Area'} = {}} = {}) => {
    return async(ctx, next) => {
        const user = auth(ctx);

        let identityCheckResult = [].concat(identities)
            .reduce((ac, opts) => {
                if (ac) {
                    return ac;
                } else if (!user || (opts.name && !compare(opts.name, user.name)) || (opts.pass && !compare(opts.pass, user.pass))) {
                    return false;
                } else {
                    return true;
                }
            }, false);
        if (!identityCheckResult) {
            throw new Error('authentication');
        }
        return next();
    };
};
