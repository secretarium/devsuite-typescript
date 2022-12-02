import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../../utils/db';
import users from './users';

const userRoute = express().use(users);

beforeAll(AppDataSource.initialize);
afterAll(AppDataSource.stop);

describe('Testing application user router', function () {
    const agent = request.agent(userRoute);

    it('Should start by returning empty list of users', async function () {
        return agent
            .get('/users')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                const { users } = response.body;
                expect(users).toBeTruthy();
                expect(users.length).toBe(0);
            });
    });
});