import { getServerSession } from "@/server/auth";
import { initTRPC, TRPCError } from "@trpc/server";

export async function createTRPCContext() {
    const session = await getServerSession()
    if(!session?.user) {
        throw new TRPCError({
            code: 'FORBIDDEN'
        })
    } 
    return {
        session
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create();

const { router, procedure } = t;

const middleware = t.middleware(async({ ctx, next}) => {
    const start = Date.now()

    const result = await next()

    console.log("-----> Api Time:", Date.now() - start)

    return result
})

const checkLoginMiddleware = t.middleware(async({ ctx, next}) => {
    if(!ctx.session?.user) {
        throw new TRPCError({
            code: "FORBIDDEN",
        })
    }
    return next()
})

const loggedProcedure = procedure.use(middleware)

const protectedProcedure = procedure.use(checkLoginMiddleware)

export const testRouter = router({
    hello: loggedProcedure.query(async( {ctx} ) => {
        return {
            hello: 'world',
        }
    })
})

export type TestRouter = typeof testRouter;