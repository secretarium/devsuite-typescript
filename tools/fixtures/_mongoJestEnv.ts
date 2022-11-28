import { v4 as uuid } from 'uuid';
import { MongoMemoryServer } from 'mongodb-memory-server';
import NodeEnvironment from 'jest-environment-node';

class CustomEnvironment extends NodeEnvironment {

    env?: NodeJS.ProcessEnv;
    mongodb?: MongoMemoryServer;

    override async setup() {
        await super.setup();
        const dbName = uuid();
        this.env = process.env;
        this.mongodb = await MongoMemoryServer.create({ instance: { dbName } });
        const mongoUri = this.mongodb.getUri()
        process.env = {
            ...this.env,
            NX_EXPRESS_SESSION_SECRETS: 'secret-test-1337',
            NX_MONGODB_URL: mongoUri
        };
        process.env.NX_MONGODB_URL = mongoUri
        console.log(process.cwd(), process.env)
    }

    override async teardown() {
        await this.mongodb?.stop();
        if (this.env)
            process.env = this.env;
        await super.teardown();
    }

}

module.exports = CustomEnvironment;
