import { createNodeMiddleware } from 'probot';
import SmeeClient from 'smee-client';
import { probot } from '@klave/providers';
import probotApp from '../probot';

const smeeClient = process.env.NODE_ENV !== 'test' ? new SmeeClient({
    source: process.env.NX_PROBOT_WEBHOOK_PROXY_URL!,
    target: 'http://127.0.0.1:3333/hook',
    logger: console
}) : null;

smeeClient?.start();

export const probotMiddleware = createNodeMiddleware(probotApp, {
    probot
});
