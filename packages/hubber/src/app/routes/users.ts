import { Router } from 'express';
import db from '../../utils/db';
import { User } from '../entities';

export const usersRouter = Router();

usersRouter.get('/users', async (res, rep) => {
    rep.status(200).json({
        users: await db.UserCollection.findAll()
    });
});

usersRouter.put('/users', async (res, rep) => {
    console.log(res.body);
    const { name, email } = res.body;
    try {
        await db.UserCollection.persist(new User({
            name,
            username: name,
            handle: name,
            emails: [email]
        })).flush();
        rep.status(200).json({ ok: true });
    } catch (e) {
        rep.status(500).json({ ok: false, exception: process.env.NODE_ENV !== 'production' ? e : undefined });
    }
});

// usersRouter.post('/user', async (res, rep) => {
//     rep.status(200).json({ users: await User.find() });
// });

export default usersRouter;