module.exports = [ // middleware order
    {
        name: 'wrapper',
        factory: require('./wrapper')
    },
    {
        name: 'audit',
        factory: require('./audit')
    },
    {
        name: 'report',
        factory: require('./report')
    },
    {
        name: 'swaggerUI',
        factory: require('./swaggerUI')
    },
    {
        name: 'formParser',
        factory: require('./formParser')
    },
    {
        name: 'bodyParser',
        factory: require('./bodyParser')
    },
    {
        name: 'logger',
        factory: require('./logger')
    },
    {
        name: 'cors',
        factory: require('./cors')
    },
    {
        name: 'conditionalGet',
        factory: require('./conditionalGet')
    },
    {
        name: 'etag',
        factory: require('./etag')
    },
    {
        name: 'router',
        factory: require('./router')
    },
    {
        name: 'validator',
        factory: require('./validator')
    },
    {
        name: 'contextProvider',
        factory: require('./contextProvider')
    },
    {
        name: 'auth',
        factory: require('./auth')
    },
    {
        name: 'basicAuth',
        factory: require('./basicAuth')
    },
    {
        name: 'jwt',
        factory: require('./jwt')
    },
    {
        name: 'requestHandler',
        factory: require('./requestHandler')
    }
];
