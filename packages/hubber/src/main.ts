import app from './app';

const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/hook`);
});

server.on('error', console.error);
