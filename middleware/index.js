module.exports = [ // middleware order
    {
        name: 'wrapper',
        factory: require('./wrapper')
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
        name: 'validator',
        factory: require('./validator')
    },
    {
        name: 'swaggerUI',
        factory: require('./swaggerUI')
    },
    {
        name: 'jwt',
        factory: require('./jwt')
    },
    {
        name: 'router',
        factory: require('./router')
    }
];
