// import { writeFile } from 'node:fs/promises';
// import { Buffer } from 'node:buffer';
import * as express from 'express';
import helmet from 'helmet';
import { rateLimiterMiddleware } from './middleware/rateLimiter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);
app.use(helmet());
app.disable('x-powered-by');

app.post('*', (req, res) => {
    console.log(req.body);
    res.json({ ok: true });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/hook`);
});
server.on('error', console.error);
