import axios from 'axios';

describe('GET /', () => {
    it('should return a message', async () => {
        const res = await axios.get('/ping').catch((err) => {
            console.error(err);
        });

        if (!res) {
            throw new Error('No response');
        }

        expect(res.status).toBe(200);
        expect(res.data).toEqual({ pong: true });
    });
});
