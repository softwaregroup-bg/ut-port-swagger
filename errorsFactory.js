module.exports = (bus) => {
    let {defineError, getError, fetchErrors} = bus.errors;
    if (!getError('swagger')) {
        const Swagger = defineError('swagger', null, 'Swagger error', 'error');
        defineError('successCodesCount', Swagger, 'Too many successful HTTP status codes have been defined. Expected: {expected}, actual: {actual}', 'error');
        defineError('xBusMethodNotDefined', Swagger, 'x-bus-method must be defined', 'error');
        defineError('routeNotFound', Swagger, 'Route not found', 'error');
        defineError('methodNotAllowed', Swagger, 'Method not allowed', 'error');
        defineError('validationNotFound', Swagger, 'Validation not found', 'error');
        defineError('requestValidation', Swagger, 'Request validation error', 'error');
        defineError('responseValidation', Swagger, 'Response validation error', 'error');
    }
    return fetchErrors('swagger');
};
