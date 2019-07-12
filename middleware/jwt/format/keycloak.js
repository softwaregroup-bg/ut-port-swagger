/* example
{
  "jti": "0074de91-bb79-4fbd-8770-2ad04e9d67b3",
  "exp": 1562850138,
  "nbf": 0,
  "iat": 1562849838,
  "iss": "http://192.168.133.220:9120/auth/realms/Test",
  "aud": "account",
  "sub": "fe3c6c3f-c166-47a3-96d2-22d07463ed63",
  "typ": "Bearer",
  "azp": "allianz",
  "auth_time": 0,
  "session_state": "74d6ed56-c229-4105-afe5-1e61f9fb3b7c",
  "acr": "1",
  "realm_access": {
    "roles": [
      "Test",
      "Test Sub",
      "offline_access",
      "Super Admin",
      "uma_authorization",
      "Mobile",
      "customer"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "profile email",
  "businessUnitName": null,
  "email_verified": false,
  "tenantName": "Test",
  "tenantId": "Test",
  "preferred_username": "stamen",
  "businessUnitId": null
}
*/
module.exports = ({
    session_state: sessionId = null,
    businessUnitId = null,
    businessUnitName = null,
    tenantId = null,
    tenantName = null,
    sub: userId = null,
    preferred_username: username = null,
    realm_access: {
        roles = []
    }
}) => {
    return {
        sessionId,
        businessUnitId,
        businessUnitName,
        tenantId,
        tenantName,
        userId,
        username,
        roles
    };
};
