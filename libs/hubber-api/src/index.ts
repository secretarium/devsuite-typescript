import 'express';
import 'express-session';
import 'passport';
import { type User as UserEntity, GitHubToken } from '@secretarium/hubber-db';

declare module 'express-session' {
    interface SessionData {
        githubToken?: GitHubToken;
        unclaimedApplications?: string[];
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User extends UserEntity { }
    }
}

export type { Router } from './router';
export { router } from './router';

export type { Context } from './context';
export { createContext } from './context';
