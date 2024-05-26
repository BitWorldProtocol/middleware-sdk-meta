import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // ...add more providers here
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {

        if (!credentials) return null;

        const { username, password } = credentials;

        if(username !== "Jocu" || password !== "123456") {
            return null;
        }
        return {
            id: "1",
            ...credentials
        };
      },
    }),
  ],
};

const handler =  NextAuth(authOptions);

export { handler as GET, handler as POST }
