import request from 'supertest';
// import express, { Express } from 'express';
import { AppDataSource } from '../utils/db';
import start from './index';

// let app: Express;

beforeAll(async () => {
    await AppDataSource.initialize();
    // app = express().use(start());
});

afterAll(AppDataSource.stop);

describe('Testing application top level', function () {
    const agent = request.agent(start());

    it('Should pong', async function () {
        return agent
            .get('/ping')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                const { pong } = response.body;
                expect(pong).toBe(true);
            });
    });
});