import { AuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
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

/**
 * 获取服务器会话
 * 
 * 该函数无参数。
 * 
 * @returns 返回一个服务器会话对象。具体返回值结构依赖于nextAuthGetServerSession函数的实现和authOptions的配置。
 */
export function getServerSession() {
    // 调用nextAuthGetServerSession函数，传入authOptions配置，获取服务器会话
    return nextAuthGetServerSession(authOptions)
}

