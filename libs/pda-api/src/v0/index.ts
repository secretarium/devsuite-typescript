import { createTRPCRouter } from '../trpc.js';
import system from './system.js';

export const v0Router = createTRPCRouter({
    system
});

export type V0Router = typeof v0Router;