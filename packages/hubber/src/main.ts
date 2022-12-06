import { start } from './app';
import './i18n';
import { AppDataSource } from './utils/db';
import logger from './utils/logger';

AppDataSource.initialize().then(async () => {

    const port = Number(process.env.PORT) || 3333;
    const server = start(port).listen(port, '0.0.0.0', () => {
        logger.info(`Listening at http://localhost:${port}`);
    });

    server.on('error', (error) => {
        logger.error(error);
        AppDataSource.stop();
    });

}).catch(error => {
    logger.error(error);
});