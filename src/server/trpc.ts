import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "@/server/auth";

const t = initTRPC.context().create();

const { router, procedure } = t;

export const withLoggerProcedure = procedure.use(async({ ctx, next }) => {
    const start = Date.now();

    const result = await next()

    console.log("---> Api time:", Date.now() - start);
    return result;
})

export const withSessionMiddleware = t.middleware(async({ ctx, next }) => {
    const session = await getServerSession();
    // 使用next函数，将session传递给后续的中间件和路由处理程序
    return next({
        ctx: {
            session,
        },
    });
})

export const protectedProcedure = withLoggerProcedure
    .use(withSessionMiddleware)
    .use(async({ ctx, next }) => { 
        if(!ctx.session?.user) {
            throw new TRPCError({
                code: 'FORBIDDEN',
            });
        }

        return next({
            ctx: {
                session: ctx.session
            },
        });
    })

export { router }    