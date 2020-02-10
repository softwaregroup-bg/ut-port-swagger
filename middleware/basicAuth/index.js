const auth = require('basic-auth');
const compare = require('tsscmp');

module.exports = ({options: {identities, realm = 'Secure Area'} = {}} = {}) => {
    return async(ctx, next) => {
        const user = auth(ctx);
        let iLen = [].concat(identities).length;

        for (var i = 0; i < iLen; i++) {
            let opts = identities[i];
            if (user && (opts.name && compare(opts.name, user.name)) && (opts.pass && compare(opts.pass, user.pass))) {
                return next();
            }
        }
        throw new Error('authentication');
    };
};
