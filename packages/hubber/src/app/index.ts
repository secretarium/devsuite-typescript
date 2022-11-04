import * as express from 'express';
import helmet from 'helmet';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);
app.use(helmet());
app.disable('x-powered-by');

app.get('/ping', (req, res) => {
    res.json({ pong: true });
});

app.post('*', (req, res) => {
    console.log(req.body);
    res.json({ ok: true });
});

export default app;