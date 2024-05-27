import { initTRPC } from '@trpc/server';
import { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const t = initTRPC.create();

const { router, procedure } = t;

export const testRouter = router({
  hello: procedure.query(() => {
    return {
        hello: 'Hello World'
    };
  }),
});

export type TestRouter = typeof testRouter;