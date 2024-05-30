import { AuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import GitlabProvider from "next-auth/providers/gitlab";
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/server/db/db";

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db) as any,
  providers: [
    GitlabProvider({
        clientId: "66f23674c2528ba6151b9cf4ee65a78d32a1627fac487586f8564cc31f0a5db3",
        clientSecret: "gloas-634cfc97ee15a5a3f49702a08b1f3a4f9ad31cb5906957c4af6ccb71a8028307"
    })
  ]
};

/**
 * 获取服务器会话
 * 
 * 该函数无参数
 * 
 * @returns 返回一个服务器会话对象。具体返回值结构依赖于nextAuthGetServerSession函数的实现和authOptions的配置。
 */
export function getServerSession() {
    // 调用nextAuthGetServerSession函数，传入authOptions配置，获取服务器会话
    return nextAuthGetServerSession(authOptions)
}

