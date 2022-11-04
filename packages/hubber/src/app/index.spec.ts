import * as request from 'supertest';
import app from './index';

describe('request.agent(app)', function () {
    const agent = request.agent(app);

    it('should pong', async function () {
        return agent
            .get('/ping')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                expect(response.body.pong).toBe(true);
            });
    });
});