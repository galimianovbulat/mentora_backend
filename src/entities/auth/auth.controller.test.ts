import { app } from 'app';
import request from 'supertest';

import { AuthService } from './auth.services';

describe('POST /auth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and tokens', async () => {
        const tokens = {
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
        };

        jest.spyOn(AuthService.prototype, 'login').mockResolvedValue(tokens);

        const response = await request(app).post('/auth').send({
            name: 'name',
            password: 'password',
        });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('accessToken', tokens.accessToken);
        expect(response.body).toHaveProperty('refreshToken', tokens.refreshToken);
    });

    it('should return 400 if body has not password', async () => {
        const response = await request(app).post('/user').send({
            name: 'admin',
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body has not name', async () => {
        const response = await request(app).post('/user').send({
            password: 'password',
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body is empty', async () => {
        const response = await request(app).post('/user').send({});

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 401 and User not found', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(new Error('User not found'));

        const response = await request(app).post('/auth').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 and Incorrect password', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(
            new Error('Incorrect password'),
        );

        const response = await request(app).post('/auth').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'Incorrect password');
    });

    it('should return 500 on unexpected error', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(
            new Error('Database exploded'),
        );

        const response = await request(app).post('/auth').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(500);

        expect(response.body).toHaveProperty('message', 'Internal server error');
    });
});
