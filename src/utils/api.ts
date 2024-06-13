/**
 * createTRPCClient:  is a function from the trpc library that create 
 * a client instance for your application. it is used to connect to 
 * a trpc server and make requests to it.
 *  
 * createTRPCReact: is a popular libary for building real-time applications with react.
 * it provides a simple and efficient way to create TRPC connections between your react 
 * application and your backend server.
 * 
 */
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