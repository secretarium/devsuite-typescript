import { readFileSync } from 'node:fs';
import { createNodeMiddleware, Probot } from 'probot';
import SmeeClient from 'smee-client';
import probotApp from '../probot';

const smeeClient = process.env.NODE_ENV !== 'test' ? new SmeeClient({
    source: process.env.NX_PROBOT_WEBHOOK_PROXY_URL!,
    target: 'http://127.0.0.1:3333/hook',
    logger: console
}) : null;

smeeClient?.start();

const probot = new Probot({
    appId: process.env.NX_PROBOT_APPID,
    privateKey: process.env.NX_PROBOT_PRIVATE_KEYFILE ? readFileSync(process.env.NX_PROBOT_PRIVATE_KEYFILE).toString() : undefined,
    secret: process.env.NX_PROBOT_WEBHOOK_SECRET,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
});

export const probotMiddleware = createNodeMiddleware(probotApp, {
    probot
});
