// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'ws';

type Data = {
    name: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const socket = res.socket as typeof res.socket & { io?: Server } | null;

    if (socket === null) {
        console.error('No socket');
        res.end();
        return;
    }

    if (socket?.io) {
        console.log('Already set up');
        res.end();
        return;
    }

    const io = new Server();
    socket.io = io;

    // Define actions inside
    io.on('connection', (ws) => {
        (ws as any).isAlive = true;
        console.info('Client is alive !');
    });
    io.on('upgrade', () => {
        console.info('Client is upgrading ...');
    });
    io.on('message', (msg) => {
        const [verb, ...data] = msg.toString().split('#');
        if (verb === 'request') {
            console.info('New bridge client request ...');
            const [locator] = data;
            console.info('Locator', locator);
            // (session as any).locator = locator;
            // session.save(() => {
            //     ws.send(`sid#${sessionID}#ws://${ip.address('public')}:${port}/bridge`);
            // });
            return;
        } else if (verb === 'confirm') {
            console.info('New remote device confirmation ...');
            // const [sid, locator, temp_print] = data;
            // sessionStore.get(sid, (err, rsession) => {
            //     if (!rsession)
            //         return;
            //     if ((rsession as any).locator !== locator)
            //         return;
            //     (rsession as any).temp_print = temp_print;
            //     sessionStore.set(sid, rsession, () => {
            //         const browserTarget = Array.from(getWss().clients.values()).find(w => (w as any).sessionID === sid);
            //         browserTarget?.send('confirmed');
            //     });
            // });
        }
        // ws.send(msg);
    });

    console.log('Setting up socket');
    res.end();
}
