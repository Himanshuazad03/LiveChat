import { AuthConfig } from "convex/server";

const authConfig: AuthConfig = {
  providers: [
    {
      type: "customJwt",
      issuer: "https://premium-weevil-1.clerk.accounts.dev",
      jwks: "https://premium-weevil-1.clerk.accounts.dev/.well-known/jwks.json",
      algorithm: "RS256",
      applicationID: "convex",
    },
  ],
};

export default authConfig;