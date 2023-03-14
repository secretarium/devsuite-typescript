import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import {
    createBrowserRouter,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes
} from 'react-router-dom';
import { useEffect } from 'react';

Sentry.init({
    dsn: process.env['NX_SENTRY_DSN'],
    integrations: [new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
        )
    })],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0
});

export const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(
    createBrowserRouter
);