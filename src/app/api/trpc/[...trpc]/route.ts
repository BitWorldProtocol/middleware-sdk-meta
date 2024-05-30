import { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { testRouter } from '@/utils/trpc';
/**
 * 处理Next.js的请求，并委托给指定的TRPC路由器进行处理。
 * 
 * @param request - Next.js的请求对象，包含了请求的详细信息。
 * @returns 返回一个Promise，该Promise解析为TRPC请求处理的结果。
 */
const handler = (request: NextRequest) => {
    // 使用fetchRequestHandler函数处理请求，配置包括终点URL、路由器、请求对象和创建上下文的函数
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: testRouter,
        createContext: () => ({} as any),
    });
}

export { handler as GET, handler as POST }