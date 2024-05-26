import NextAuth, { AuthOptions } from "next-auth";
import GitlabProvider from "next-auth/providers/gitlab";
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db";

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  providers: [
    GitlabProvider({
        clientId: "4c6bbdcbeb521cbe93e7ea407505f7373a2c0008db366e228b474eb4852462a9",
        clientSecret: "gloas-2575d4ae79dc547f804d225fe225657a08c7332ac7f85b14c5865c33cb206bb2"
    })
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
