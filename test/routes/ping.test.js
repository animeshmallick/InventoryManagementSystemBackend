const request = require('supertest');
const app = require('../../app');

describe('GET /api/index', () => {
    it('should responds with a 200 and a success message', async () => {
        const res = await request(app).get('/ping');
        expect(res.statusCode).toBe(200);
        expect(res.body.hasOwnProperty('message')).toBe(true);
        expect(res.body.message).toBe('Ping From Backend Server');
    });
})