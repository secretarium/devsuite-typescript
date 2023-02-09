import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext, router as appRouter } from '@secretarium/hubber-api';

export const trcpMiddlware = trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
});
