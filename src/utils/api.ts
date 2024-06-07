import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";

/**
 * create tRPC hooks
 * 设置 client usage: react query intergration
 * https://trpc.io/docs/client/react/setup
 */
export const trpcClientReact = createTRPCReact<AppRouter>({});

export const trpcClient = trpcClientReact.createClient({
  links: [
    httpBatchLink({
      // you can pass any http headers you wish here 
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});

export const trpcPureClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});

export { AppRouter }