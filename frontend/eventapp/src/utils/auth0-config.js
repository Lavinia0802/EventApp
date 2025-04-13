// Configuration for Auth0
export const auth0Config = {
  domain: "lavinia-test.us.auth0.com",
  clientId: "qjJRwzSLfeC9ZeIOrsHe6ySswhpKT5J3",
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: "https://events-api/",
  },
};
