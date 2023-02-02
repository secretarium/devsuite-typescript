import { createTRPCRouter } from '../trpc';
import auth from './auth';
import user from './user';
import repos from './repos';
import applications from './applications';
import deployements from './deployements';
import activities from './activities';
import domains from './domains';
import hooks from './hooks';

export const v0Router = createTRPCRouter({
    auth,
    user,
    repos,
    applications,
    deployements,
    activities,
    domains,
    hooks
});

export type V0Router = typeof v0Router;