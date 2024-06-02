import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";

/**
 * 设置 client usage: react query intergration
 * https://trpc.io/docs/client/react/setup
 */
export const trpcClientReact = createTRPCReact<AppRouter>({});

export const trpcClient = trpcClientReact.createClient({
  links: [
    httpBatchLink({
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
