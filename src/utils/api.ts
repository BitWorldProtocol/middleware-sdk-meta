import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TestRouter } from "./trpc"
import { createTRPCReact } from "@trpc/react-query";

/**
 * 这段代码是使用TypeScript创建了一个TRPC（Transparent RPC）客户端。 
 * 首先，通过createTRPCReact<TestRouter>({})创建了一个TRPC的React客户端，
 *      它接收一个TestRouter作为参数。 
 * 然后，使用createClient方法创建了一个TRPC客户端实例trpcClient，
 *      该实例通过links属性配置了一个HTTP链接，该链接指定了TRPC服务的
 *      URL地址为"http://localhost:3000/api/trpc"。
 */
export const trpcClientReact = createTRPCReact<TestRouter>({});

export const trpcClient = trpcClientReact.createClient({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});


