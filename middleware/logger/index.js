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
        logPaths.map((path) => {
            const data = getDataByPath(path, ctx);
            data && port.log.info({path, data});
        });
        next();
    };
};
