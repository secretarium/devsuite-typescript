import { startPruner } from '@klave/pruner';
import { start } from './app';
import './i18n';
import { AppDataSource } from './utils/db';
import { scpOps } from '@klave/providers';
import logger from './utils/logger';

AppDataSource.initialize()
    .then(scpOps.initialize)
    .then(async () => {

        const port = Number(process.env.PORT) || 3333;
        const host = process.env.HOST || '127.0.0.1';
        const server = (await start(port)).listen(port, host, () => {
            logger.info(`Listening at http://${host}:${port}`);
        }).on('error', function (err) {
            console.error(err);
        });

        server.on('error', (error) => {
            logger.error(error);
            AppDataSource.stop();
        });

        startPruner();

    }).catch(error => {
        logger.error(error);
    });