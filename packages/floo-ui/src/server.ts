import os from 'os';
import type { Application } from 'express';
import getPort from 'get-port';
import { watch /*, dev */ } from '@remix-run/dev/cli/commands';
import { readConfig } from '@remix-run/dev/config';
import { loadEnv } from '@remix-run/dev/env';
import type { Server } from 'http';

const purgeAppRequireCache = (buildPath: string) => {
    for (const key in require.cache) {
        if (key.startsWith(buildPath)) {
            delete require.cache[key];
        }
    }
};

const startServer = async () => {

    let createApp: any;
    let express: any;

    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serve = require('@remix-run/serve');
        createApp = serve.createApp;
        express = require('express');
    } catch (err) {
        throw new Error(
            'Could not locate @remix-run/serve. Please verify you have it installed ' +
            'to use the dev command.'
        );
    }

    const mode = process.env.NODE_ENV;
    const config = await readConfig();

    await loadEnv(config.rootDirectory);

    const port = await getPort({
        port: process.env.PORT ? Number(process.env.PORT) : 3000
    });

    const app: Application = express();
    app.disable('X-Powered-By');
    app.use((_, res, next) => {
        purgeAppRequireCache(config.serverBuildPath);
        next();
    });
    app.use(createApp(config.serverBuildPath, mode));

    let server: Server | null = null;

    try {
        await watch(config, mode, {
            onInitialBuild: () => {
                const onListen = () => {
                    const address =
                        process.env.HOST ||
                        Object.values(os.networkInterfaces())
                            .flat()
                            .find((ip) => ip?.family === 'IPv4' && !ip.internal)?.address;

                    if (!address) {
                        console.log(`Remix App Custom Server started at http://localhost:${port}`);
                    } else {
                        console.log(
                            `Remix App Custom Server started at http://localhost:${port} (http://${address}:${port})`
                        );
                    }
                };

                server = process.env.HOST
                    ? app.listen(port, process.env.HOST, onListen)
                    : app.listen(port, onListen);
            }
        });
    } finally {
        (server as Server | null)?.close();
    }
};

startServer();
