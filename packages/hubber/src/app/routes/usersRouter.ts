import { Router } from 'express';
import passport from 'passport';
import fetch from 'node-fetch';
import { createUser, getUsers } from '../controllers/userController';
import db, { GitHubToken } from '../../utils/db';

export const usersRouter = Router();

usersRouter.get('/whoami', async ({ user, session }, res) => {
    if (user)
        res.status(200).json({ me: user });
    else
        res.status(401).json({ who: 'An unknown unicorn', has_github_token: !!session.github_token });
});

usersRouter.get('/login/print', async (req, res, next) => {
    req.body = {
        username: req.session.id,
        password: (req.session as any).temp_print
    };
    next();
}, passport.authenticate('local', {
    passReqToCallback: true
}), async (req, res) => {
    res.status(200).json({ ...req.user });
});

usersRouter.get('/logout', async (req, res) => {
    req.logout({
        keepSessionInfo: false
    }, () => {
        res.status(200).json({ success: true });
    });
});

usersRouter.get('/users', async (req, res) => {
    res.status(200).json({
        users: await getUsers()
    });
});

usersRouter.post('/users', async (req, res) => {
    try {
        await createUser(req.body);
        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, exception: process.env.NODE_ENV !== 'production' ? e : undefined });
    }
});

declare module 'express-session' {
    interface SessionData {
        github_token: GitHubToken
    }
}

usersRouter.get('/log_in_github', async (req, res) => {
    if (req.session.github_token)
        return res.status(200).json({
            data: req.session.github_token
        });
    // if (!req.user) {
    //     res.status(400).json({ ok: false, message: 'Not logged-in' });
    //     return;
    // }
    // const currentUser = await db.user.findUnique({ where: { id: req.user.id } });
    // if (!currentUser) {
    //     res.status(400).json({ ok: false, message: 'User not found' });
    //     return;
    // }
    const user = !req.user ? null : await db.user.findUnique({ where: { id: req.user.id } });
    const { code, redirect_uri } = req.query;
    try {
        const result = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.NX_GITHUB_CLIENTID,
                client_secret: process.env.NX_GITHUB_CLIENTSECRET,
                code,
                redirect_uri
            })
        });
        const data = {
            ...await result.json(),
            created_at: Date.now()
        };
        if (!data.access_token) {
            res.status(500).json({ ok: false, message: 'Access token could not be retreived', data });
            return;
        }
        if (user) {
            user.github_tokens.push(data);
            await db.user.update({
                where: { id: user.id },
                data: user
            });
        }
        req.sessionStore.set(req.sessionID, {
            ...req.session,
            github_token: data
        }, (err) => {
            if (err)
                return res.status(500).json({
                    ok: false, exception: err
                });
            return res.status(200).json({
                data
            });
        });
    } catch (e) {
        res.status(500).json({ ok: false, exception: process.env.NODE_ENV !== 'production' ? e : undefined });
    }
    return;
});

export default usersRouter;