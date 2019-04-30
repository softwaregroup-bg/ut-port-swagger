module.exports = ({options}) => {
    const {handlers} = options;
    return (ctx, next) => {
        const {method, successCode} = ctx.ut;
        if (handlers[method]) {
            ctx.body = handlers[method]();
            ctx.status = successCode;
        } else {
            return next();
        }
    };
};
