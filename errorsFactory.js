module.exports = (bus) => {
    let {defineError, getError, fetchErrors} = bus.errors;
    if (!getError('swagger')) {
        const Swagger = defineError('swagger', null, 'Swagger error', 'error');
        defineError('requestValidation', Swagger, 'Request validation error', 'error');
        defineError('responseValidation', Swagger, 'Response validation error', 'error');
    }
    return fetchErrors('swagger');
};
