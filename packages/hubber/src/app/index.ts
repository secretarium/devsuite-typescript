import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import multer from 'multer';
// import { csrfSync } from 'csrf-sync';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { morganLoggerMiddleware } from './middleware/morganLogger';
import { probotMiddleware } from './middleware/probot';
import { getDriverSubstrate } from '../utils/db';
import { usersRouter } from './routes';

const app = express();

export const start = () => {

    app.use(morganLoggerMiddleware);
    app.use(rateLimiterMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
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
        saveUninitialized: false,
        store: MongoStore.create(mongoOptions)
    };

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1); // trust first proxy
        sessionOptions.cookie = { secure: true }; // serve secure cookies
    }

    app.use(session(sessionOptions));
    // app.get('/csrf-token', (req, res) => res.json({ token: generateToken(req) }));
    // app.use(csrfSynchronisedProtection);
    app.use(passport.authenticate('session'));

    app.get('/ping', (req, res) => {
        res.json({ pong: true });
    });

    app.use(usersRouter);

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