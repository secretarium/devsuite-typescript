import * as trpcExpress from '@trpc/server/adapters/express';
import { router, createContext, v0Router as v0 } from '@secretarium/hubber-api';

const appRouter = router({
    v0
});

export const trcpMiddlware = trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
});
