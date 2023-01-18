import { createTRPCRouter } from '../trpc';
import auth from './auth';
import user from './user';
import repos from './repos';

export const v0Router = createTRPCRouter({
    auth,
    user,
    repos
});

export type V0Router = typeof v0Router;