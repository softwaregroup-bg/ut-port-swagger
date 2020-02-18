module.exports = ({port}) => {
    return async(ctx, next) => {
        if (!Array.isArray(ctx.ut.security)) return next();
        const types = {};
        for (let i = 0, n = ctx.ut.security.length; i < n; i += 1) {
            const types = Object.keys(ctx.ut.security[i]);
            if (types.length === 0) return next(); // empty authentication set
            types.forEach(type => { types[type] = true; });
        }
        let verified = false;
        const securityRules = ctx.ut.security.map(rules => {
            const resolved = {};
            const totalCount = Object.keys(rules).length;
            let resolvedCount = 0;
            return {
                resolve(type) {
                    if (verified || !rules[type] || resolved[type]) return;
                    resolved[type] = true;
                    if (++resolvedCount === totalCount) verified = true;
                }
            };
        });

        ctx.ut.auth = {
            getResolver(type) {
                if (verified || !types[type]) return false;
                return () => securityRules.forEach(({resolve}) => resolve(type));
            },
            verify() {
                if (!verified) throw port.errors['swagger.securityViolation']();
            }
        };
        return next();
    };
};
