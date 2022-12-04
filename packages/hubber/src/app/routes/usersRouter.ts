import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController';

export const usersRouter = Router();

usersRouter.get('/whoami', async ({ user }, res) => {
    if (user)
        res.status(200).json({ me: user });
    else
        res.status(401).json({ who: 'An unknown unicorn' });
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

export default usersRouter;