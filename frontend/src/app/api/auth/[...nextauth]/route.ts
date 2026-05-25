import NextAuth, { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oauth",
      clientId: process.env.KEYCLOAK_CLIENT_ID || "crash-game-client",
      clientSecret: "no-secret",
      client: {
        token_endpoint_auth_method: "none",
      },
      authorization: {
        url: "http://localhost:8080/realms/crash-game/protocol/openid-connect/auth",
        params: { scope: "openid email profile" },
      },
      token: "http://keycloak:8080/realms/crash-game/protocol/openid-connect/token",
      userinfo: "http://keycloak:8080/realms/crash-game/protocol/openid-connect/userinfo",
      jwks_endpoint: "http://keycloak:8080/realms/crash-game/protocol/openid-connect/certs",
      issuer: "http://localhost:8080/realms/crash-game",
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
        };
      },
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile) {
        token.id = profile.sub
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
