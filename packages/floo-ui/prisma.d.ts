import { PrismaClient } from './src/app/models/client';

declare global {
    // eslint-disable-next-line no-var
    var __db__: PrismaClient;
}