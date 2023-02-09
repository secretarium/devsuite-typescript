import { start } from './app';
import './i18n';
import { AppDataSource } from './utils/db';
import { AppLedgerSource } from './utils/secretarium';
import logger from './utils/logger';

AppDataSource.initialize()
    .then(AppLedgerSource.initialize)
    .then(async () => {

        const port = Number(process.env.PORT) || 3333;
        const server = start(port).listen(port, '127.0.0.1', () => {
            logger.info(`Listening at http://127.0.0.1:${port}`);
        });

        server.on('error', (error) => {
            logger.error(error);
            AppDataSource.stop();
        });

    }).catch(error => {
        logger.error(error);
    });