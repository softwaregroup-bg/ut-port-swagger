module.exports = [ // middleware order
    {
        name: 'wrapper',
        factory: require('./wrapper')
    },
    {
        name: 'swaggerUI',
        factory: require('./swaggerUI')
    },
    {
        name: 'cors',
        factory: require('./cors')
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
        name: 'jwt',
        factory: require('./jwt')
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
        name: 'requestHandler',
        factory: require('./requestHandler')
    }
];
