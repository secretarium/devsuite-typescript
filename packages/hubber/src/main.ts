import { start } from './app';
import { AppDataSource } from './utils/db';

AppDataSource.initialize().then(async () => {

    const port = Number(process.env.PORT) || 3333;
    const server = start().listen(port, () => {
        console.log(`Listening at http://localhost:${port}`);
    });

    server.on('error', console.error);

});