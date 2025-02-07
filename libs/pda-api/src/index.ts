import 'express';
import 'express-session';
import 'passport';
// import { type User as UserEntity, GitHubToken, Web } from '@klave/db';

// type FilteredUserEntity = Pick<UserEntity, 'id' | 'slug' | 'globalAdmin'> & { personalOrganisationId?: string };

// declare module 'express-session' {
//     interface SessionData {
//         githubToken?: GitHubToken;
//         currentChallenge?: string;
//         user?: FilteredUserEntity;
//     }
// }

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
        interface Request {
            // web: Web;
            // webId: string;
        }
    }
}

// export * from './types';

export type { Router } from './router.js';
export { router } from './router.js';

export type { Context } from './context.js';
export { createContext } from './context.js';
export { createCallerFactory } from './trpc.js';

// export * from './deployment/deploymentController';
