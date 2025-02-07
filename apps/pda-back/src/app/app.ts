// import * as path from 'node:path';
// import * as url from 'node:url';
import { FastifyInstance } from 'fastify';
import rateLimiter from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
// import statics from '@fastify/static';
import websocket from '@fastify/websocket';
import rootRoute from './routes/root.js';

// const dirname = path.dirname(url.fileURLToPath(import.meta.url));

/* eslint-disable-next-line */
export interface AppOptions { }

export async function app(server: FastifyInstance) {

    // This loads all plugins defined in plugins
    // those should be support plugins that are reused
    // through your application

    // Register skeleton plugins.
    await server.register(rateLimiter, {
        max: 100,
        timeWindow: '1 minute'
    });
    await server.register(helmet);
    await server.register(sensible);
    await server.register(websocket);
    // await server.register(statics, {
    //     root: `${dirname}/../assets`,
    //     prefix: '/'
    // });

    // This loads all plugins defined in routes
    // define your routes in one of these
    server.register(rootRoute);
}
