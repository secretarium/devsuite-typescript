import { createTRPCRouter } from '../trpc';
import auth from './auth';
import user from './user';
import repos from './repos';
import applications from './applications';

export const v0Router = createTRPCRouter({
    auth,
    user,
    repos,
    applications
});

export type V0Router = typeof v0Router;