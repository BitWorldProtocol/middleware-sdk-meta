import { initTRPC, TRPCError } from '@trpc/server';
import { createCallerFactory } from '@trpc/server/unstable-core-do-not-import';
import { getServerSession } from 'next-auth';
/**
 * 异步创建TRPC上下文环境
 * 
 * 该函数主要负责创建一个TRPC的上下文环境，其中包括会话（session）信息。
 * 在创建过程中，它会尝试获取服务器端的会话信息，并基于会话状态来决定是否允许继续。
 * 如果会话中没有用户信息，表示未授权，将抛出一个TRPC错误。
 * 
 * @returns {Promise<{session: SessionType}>} 返回一个包含会话信息的对象Promise。
 *          会话信息中应包含用户信息，用于后续的权限验证和业务逻辑处理。
 * @throws {TRPCError} 如果会话不存在或会话中的用户信息为空，则抛出未授权错误。
 */
export async function createTRPCContext() {
    // 尝试从服务器获取会话信息
    const session = await getServerSession();
    
    // 检查会话信息是否有效，无效则抛出未授权错误
    if(!session?.user) {
        throw new TRPCError({
            code: 'UNAUTHORIZED'
        })
    }

    // 返回包含有效会话信息的对象
    return {
        session
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create();

const { router, procedure } = t;

// const middleware = t.middleware(async({ ctx: next }) => {
//     const start = Date.now();

//     const result = await next();

//     console.log(`${Date.now() - start}ms`);

//     return result
// })

// const loggedProcedure = procedure.use(middleware);

export const testRouter = router({
  hello: procedure.query(({ctx}) => {
    return {
        hello: 'Hello World'
    };
  }),
});

export type TestRouter = typeof testRouter;


export const serverCaller = createCallerFactory()(testRouter);