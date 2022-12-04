import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { initTRPC, inferAsyncReturnType } from '@trpc/server';

// You can use any variable name you like.
// We use t to keep things simple.
export const createContext = async ({
    req
    // res
}: CreateExpressContextOptions) => {
    async function getUserFromHeader() {
        if (req.headers.authorization) {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    }
    const authorization = await getUserFromHeader();
    return {
        authorization
    };
};
type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure;