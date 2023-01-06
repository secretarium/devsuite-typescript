/*
 * This is only a minimal custom server to get started.
 * You may want to consider using Express or another server framework, and enable security features such as CORS.
 *
 * For more examples, see the Next.js repo:
 * - Express: https://github.com/vercel/next.js/tree/canary/examples/custom-server-express
 * - Hapi: https://github.com/vercel/next.js/tree/canary/examples/custom-server-hapi
 */
import { createServer } from 'http';
import { parse } from 'url';
import * as path from 'path';
import next from 'next';
import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { router, createContext } from '@secretarium/hubber-api';

// Next.js server options:
// - The environment variable is set by `@nrwl/next:server` when running the dev server.
// - The fallback `__dirname` is for production builds.
// - Feel free to change this to suit your needs.
const dir = process.env.NX_NEXT_DIR || path.join(__dirname, '../..');
const dev = process.env.NODE_ENV === 'development';

// HTTP Server options:
// - Feel free to change this to suit your needs.
const hostname = process.env.HOST || 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT) : 4200;

async function main() {
    const nextApp = next({ dev, dir });
    const handle = nextApp.getRequestHandler();

    await nextApp.prepare();

    const server = createServer((req, res) => {
        // const proto = req.headers['x-forwarded-proto'];
        // if (proto && proto === 'http') {
        //     // redirect to ssl
        //     res.writeHead(303, {
        //         location: 'https://' + req.headers.host + (req.headers.url ?? '')
        //     });
        //     res.end();
        //     return;
        // }
        const parsedUrl = req.url ? parse(req.url, true) : undefined;
        handle(req, res, parsedUrl);
    });
    const wss = new ws.Server({ server });
    const handler = applyWSSHandler({ wss, router, createContext } as any);

    process.on('SIGTERM', () => {
        console.log('SIGTERM');
        handler.broadcastReconnectNotification();
    });

    server.listen(port, hostname);

    console.log(`[ ready ] on http://${hostname}:${port}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
