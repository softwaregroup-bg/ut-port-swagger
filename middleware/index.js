module.exports = [ // middleware order
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
        name: 'router',
        factory: require('./router')
    }
];
