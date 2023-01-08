import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import type { RequestHandler } from 'express';
import db, { User as UserEntity } from '../../utils/db';
import logger from '../../utils/logger';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User extends UserEntity { }
    }
}

passport.serializeUser((user, cb) => {
    logger.debug('serializeUser', typeof user, user);
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.login
        });
    });
});

passport.deserializeUser((user: Express.User, cb) => {
    logger.debug('deserializeUser', typeof user, user);
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(new LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, cb) => {
    try {
        if (!username || !password)
            return cb(null, false, { message: 'User was not confirmed by remote device.' });
        const { temp_print } = req.session as any;
        const existingUser = await db.user.findFirst({
            where: {
                devices: {
                    has: temp_print
                }
            }
        });
        // const existingUser = db.UserCollection.findOne({
        //     devices: {
        //         $contains: [temp_print]
        //     }
        // });
        console.log('LocalStrategy > existingUser', existingUser);
        // TODO Plug-in user construct
        // const user = existingUser;
        const user = req.session;
        // const user = await db.UserCollection.findOne({
        //     name: username
        // });
        if (!user)
            return cb(null, false, { message: 'User was not confirmed by remote device.' });
        cb(null, user);
    } catch (error) {
        cb(error);
    }
}));

// export const passportMiddleware = passport.authenticate('session');
export const passportLoginCheckMiddleware: RequestHandler = (req, res, next) => {
    const user = req.user ? req.user.id : null;
    if (user !== null) {
        next();
    } else if (req.url === '/users/login' || req.url === '/login/print' || req.url === '/whoami') {
        next();
    } else {
        res.status(400).json({ status: 'error', message: 'Please login first' });
    }
};