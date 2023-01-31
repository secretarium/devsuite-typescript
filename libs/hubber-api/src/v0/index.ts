import { createTRPCRouter } from '../trpc';
import auth from './auth';
import user from './user';
import repos from './repos';
import applications from './applications';
import deployements from './deployements';
import domains from './domains';

export const v0Router = createTRPCRouter({
    auth,
    user,
    repos,
    applications,
    deployements,
    domains
});

export type V0Router = typeof v0Router;