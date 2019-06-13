// module.exports = () => {
//     throw new Error('Open api v3 not yet supported');
// };

module.exports = async swaggerDocument => {
    return (path, method) => {
        return {
            async request() {

            },
            async response() {

            }
        };
    };
};
