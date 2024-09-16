import axios from 'axios';
import { exec, ChildProcess } from 'node:child_process';
// import axios from 'axios';

declare global {
    // eslint-disable-next-line no-var
    var __RUNNING_BACKEND__: ChildProcess | undefined;
}

export default async function () {
    // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
    console.log('\nStarting up the backend...\n');

    let shouldPrintProcessOutput = true;
    globalThis.__RUNNING_BACKEND__ = exec('y arn nx serve pda-back --configuration=production --watch=false');
    globalThis.__RUNNING_BACKEND__.on('error', (err) => {
        console.error(err);
    });
    globalThis.__RUNNING_BACKEND__.stdout?.on('data', (data) => {
        if (data.includes('listening at'))
            shouldPrintProcessOutput = false;
        if (shouldPrintProcessOutput)
            console.log(data);
    });

    // Start the webserver and wait until it responds
    await new Promise<void>((resolve, reject) => {
        (async () => {
            const sleep = async () => new Promise(r => setTimeout(r, 5000));
            let count = 0;
            while (count < 10) {
                await sleep();
                try {
                    await axios.get('http://localhost:3000/ping').then((result) => {
                        axios.defaults.baseURL = 'http://localhost:3000';
                        console.log('Backend is up and running');
                        if (result.status === 200)
                            resolve();
                    });
                } catch (e) {
                    if (e instanceof Error)
                        e.message.substring(0, 0);
                    if (count === 5)
                        console.log('Waiting for the backend to start...');
                }
                count++;
            }
            reject('Backend did not start in time');
        })().catch(reject);
    });
}
