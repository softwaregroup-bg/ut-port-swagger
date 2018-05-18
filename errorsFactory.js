module.exports = (bus) => {
    let {defineError, getError, fetchErrors} = bus.errors;
    if (!getError('swagger')) {
        defineError('swagger', null, 'swagger error', 'error');
    }
    return fetchErrors('swagger');
};
