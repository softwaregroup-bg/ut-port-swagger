/* example
{
    "timezone": "+00:00",
    "xsrfToken": "fe0946bc-a0d2-485e-ba2e-a19fb495a7fe",
    "actorId": "1138",
    "sessionId": "BE289615-C82E-455C-8511-283D63BE0DDF",
    "scopes": [
        {"actionId": "a.b.c", "objectId": "d"}
    ],
    "iat": 1565615655,
    "exp": 1565619255
}
*/
module.exports = ({
    sessionId = null,
    businessUnitId = null,
    businessUnitName = null,
    tenantId = null,
    tenantName = null,
    actorId: userId = null,
    username = null,
    name = null,
    roles = []
}) => {
    return {
        sessionId,
        businessUnitId,
        businessUnitName,
        tenantId,
        tenantName,
        userId,
        username,
        name,
        roles
    };
};
