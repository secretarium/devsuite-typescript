import request from 'supertest';
import users from './users';

describe('request.agent(users)', function () {
    const agent = request.agent(users);

    it('should return users', async function () {
        return agent
            .get('/users')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                const { users } = response.body;
                expect(users).toBeTruthy();
                expect(users.length).toBeDefined();
            });
    });
});