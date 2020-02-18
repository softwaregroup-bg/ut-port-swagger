module.exports = () => {
    return async(ctx, next) => {
        const {ut: {security, securityCheck, securityCheckState}} = ctx;
        if (!security.length) {
            return next();
        }
        if (!securityCheck(securityCheckState)) {
            throw new Error('securityCheck');
        }
        return next();
    };
};
