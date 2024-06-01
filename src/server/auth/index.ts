import { AuthOptions, DefaultSession, getServerSession as nextAuthGetServerSession } from "next-auth";
import GitlabProvider from "next-auth/providers/gitlab";
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  callbacks: {
    async session({ session, user}) {
      if(session.user && user) {
        session.user.id = user.id;
      }
      return session
    }
  },
  providers: [
    GitlabProvider({
        clientId: "66f23674c2528ba6151b9cf4ee65a78d32a1627fac487586f8564cc31f0a5db3",
        clientSecret: "gloas-634cfc97ee15a5a3f49702a08b1f3a4f9ad31cb5906957c4af6ccb71a8028307"
    })
  ],
  // secret: "k8roXCsd/d5uz74CBJVUEwcIHe850xJHqVsxFnNlHgI=",
};
/**
 * 获取服务器会话
 * 该函数无参数
 * @returns 返回一个服务器会话对象。具体返回值结构依赖于nextAuthGetServerSession函数的实现和authOptions的配置。
 */
export function getServerSession() {
    // 调用nextAuthGetServerSession函数，传入authOptions配置，获取服务器会话
    return nextAuthGetServerSession(authOptions)
}

