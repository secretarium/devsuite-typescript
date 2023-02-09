import { Router } from 'express';

export const filesRouter = Router();

filesRouter.get('/files', async ({ user, web }, res) => {
    if (user)
        res.status(200).json({ me: user });
    else
        res.status(401).json({ who: 'An unknown unicorn', hasGithubToken: !!web.githubToken });
});

export default filesRouter;