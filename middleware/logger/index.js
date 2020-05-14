const getDataByPath = (path = [], obj = {}) => {
    const cp = path.concat([]);
    const curr = cp.shift();
    if (cp.length === 0) {
        return obj[curr];
    } else {
        return getDataByPath(cp, obj[curr]);
    }
};
module.exports = ({port, options: {logPaths = []}}) => {
    return (ctx, next) => {
        const data = logPaths
            .map((path) => getDataByPath(path, ctx))
            .filter(Boolean);
        data && port.log.info({logPaths, data});
        next();
    };
};
