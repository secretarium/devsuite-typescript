import { createTRPCRouter } from './trpc.js';
import { v0Router } from './v0/index.js';

export const router = createTRPCRouter({
    v0: v0Router
});

export type Router = typeof router;
