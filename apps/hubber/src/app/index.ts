import './opentelemetry';
import ip from 'ip';
import express from 'express';
import session from 'express-session';
import ews from 'express-ws';
import helmet from 'helmet';
import multer from 'multer';
import cors from 'cors';
// import { csrfSync } from 'csrf-sync';
import passport from 'passport';
// import MongoStore from 'connect-mongo';
import { v4 as uuid } from 'uuid';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from '@secretarium/hubber-db';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { morganLoggerMiddleware } from './middleware/morganLogger';
import { probotMiddleware } from './middleware/probot';
import { sentryRequestMiddleware, sentryTracingMiddleware, sentryErrorMiddleware } from './middleware/sentry';
import { passportLoginCheckMiddleware } from './middleware/passport';
import { trcpMiddlware } from './middleware/trpc';
// import { i18nextMiddleware } from './middleware/i18n';
// import { getDriverSubstrate } from '../utils/db';
import { usersRouter, filesRouter } from './routes';
import logger from '../utils/logger';
import { webLinkerMiddlware } from './middleware/webLinker';

const { app, getWss } = ews(express(), undefined, {
    wsOptions: {
        clientTracking: true
    }
});

export const start = (port?: number) => {

    app.use(sentryRequestMiddleware);
    app.use(sentryTracingMiddleware);
    app.use(morganLoggerMiddleware);
    app.use(rateLimiterMiddleware);
    app.use(cors({
        origin: ['chrome-extension://', `http://localhost:${port}`, `http://127.0.0.1:${port}`],
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // app.use(i18nextMiddleware);
    app.use(multer().none());
    app.use(helmet());
    app.disable('x-powered-by');

    // Plug Probot for GitHub Apps
    app.use('/hook', probotMiddleware);

    // const {
    //     generateToken,
    //     csrfSynchronisedProtection
    // } = csrfSync();

    // const mongoOptions = {
    //     client: getDriverSubstrate(),
    //     collectionName: 'sessions'
    // };

    const sessionOptions: session.SessionOptions = {
        secret: process.env.NX_EXPRESS_SESSION_SECRETS?.split(',') ?? [],
        // Don't save session if unmodified
        resave: true,
        // Don't create session until something stored
        saveUninitialized: true,
        // store: MongoStore.create(mongoOptions),
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
                sessionModelName: 'session'
            }
        ),
        genid: () => uuid()
    };

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1); // trust first proxy
        sessionOptions.cookie = { secure: true }; // serve secure cookies
    }

    app.get('/ping', (req, res) => {
        res.json({ pong: true });
    });
    app.use(session(sessionOptions));
    // app.get('/csrf-token', (req, res) => res.json({ token: generateToken(req) }));
    // app.use(csrfSynchronisedProtection);
    app.use(passport.initialize());
    app.use(passport.session());

    // Contextualise user session, devices, tags, tokens
    app.use(webLinkerMiddlware);

    app.ws('/bridge', (ws, { session, sessionID, sessionStore }) => {
        logger.info('Wassssup ? ...');
        (ws as any).sessionID = sessionID;
        ws.on('connection', (ws) => {
            ws.isAlive = true;
            logger.info('Client is alive !');
        });
        ws.on('upgrade', () => {
            logger.info('Client is upgrading ...');
        });
        ws.on('message', (msg) => {
            const [verb, ...data] = msg.toString().split('#');
            if (verb === 'request') {
                logger.info('New bridge client request ...');
                const [locator] = data;
                (session as any).locator = locator;
                session.save(() => {
                    ws.send(`sid#${sessionID}#ws://${ip.address('public')}:${port}/bridge`);
                });
                return;
            } else if (verb === 'confirm') {
                logger.info('New remote device confirmation ...');
                const [sid, locator, localId] = data;
                sessionStore.get(sid, (err, rsession) => {
                    if (!rsession)
                        return;
                    if ((rsession as any).locator !== locator)
                        return;
                    (rsession as any).localId = localId;
                    sessionStore.set(sid, rsession, () => {
                        const browserTarget = Array.from(getWss().clients.values()).find(w => (w as any).sessionID === sid);
                        browserTarget?.send('confirmed');
                    });
                });
            }
            ws.send(msg);
        });
    });

    app.use(passportLoginCheckMiddleware);
    app.use('/trpc', trcpMiddlware);
    app.use(usersRouter);
    app.use(filesRouter);

    app.use(sentryErrorMiddleware);

    app.all('*', (req, res) => {
        res.json({
            path: req.path,
            hubber: true,
            ok: true
        });
    });

    return app;
};

export default start;