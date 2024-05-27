import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TestRouter } from "./trpc"
import { createTRPCReact } from "@trpc/react-query";

export const trpcClientReact = createTRPCReact<TestRouter>();

/**
 * 创建一个TRPC客户端实例
 * 
 * @param TestRouter - 定义了客户端将要使用的路由结构。
 * @returns 返回一个配置好的TRPC客户端实例。
 */
export const trpcClient = createTRPCClient<TestRouter>({
  links: [
    // 配置HTTP批处理链接，指定TRPC服务的URL。
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});


