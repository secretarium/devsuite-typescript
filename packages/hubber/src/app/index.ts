import express from 'express';
import session from 'express-session';
import ews from 'express-ws';
import helmet from 'helmet';
import multer from 'multer';
import cors from 'cors';
// import { csrfSync } from 'csrf-sync';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { v4 as uuid } from 'uuid';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { morganLoggerMiddleware } from './middleware/morganLogger';
import { probotMiddleware } from './middleware/probot';
import { sentryRequestMiddleware, sentryTracingMiddleware, sentryErrorMiddleware } from './middleware/sentry';
import { passportMiddleware } from './middleware/passport';
import { trcpMiddlware } from './middleware/trpc';
// import { i18nextMiddleware } from './middleware/i18n';
import { getDriverSubstrate } from '../utils/db';
import { usersRouter } from './routes';

const { app } = ews(express(), undefined, {
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
        origin: ['chrome-extension://', `http://localhost:${port}`],
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

    const mongoOptions = {
        client: getDriverSubstrate()
    };

    const sessionOptions: session.SessionOptions = {
        secret: process.env.NX_EXPRESS_SESSION_SECRETS?.split(',') ?? [],
        // Don't save session if unmodified
        resave: false,
        // Don't create session until something stored
        saveUninitialized: true,
        store: MongoStore.create(mongoOptions)
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

    app.ws('/echo', (ws, { session }) => {
        ws.on('message', (msg) => {
            const [verb, data] = msg.toString().split(':');
            if (verb === 'request') {
                const beacon = uuid();
                (session as any).locator = data;
                (session as any).beacon = beacon;
                session.save(() => {
                    ws.send(`beacon:${beacon}`);
                });
                return;
            }
            ws.send(msg);
        });
    });

    app.use(passportMiddleware);
    app.use('/trpc', trcpMiddlware);
    app.use(usersRouter);

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