import { app } from 'app';
import { ApiError } from 'errors/api-error';
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

        const response = await request(app).post('/login').send({
            name: 'name',
            password: 'password',
        });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('accessToken', tokens.accessToken);
        expect(response.body).toHaveProperty('refreshToken', tokens.refreshToken);
    });

    it('should return 400 if body has not password', async () => {
        const response = await request(app).post('/login').send({
            name: 'admin',
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request');
        expect(response.body).toHaveProperty(
            'errors',
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['password'],
                }),
            ]),
        );
    });

    it('should return 400 if body has not name', async () => {
        const response = await request(app).post('/login').send({
            password: 'password',
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request');
        expect(response.body).toHaveProperty(
            'errors',
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['name'],
                }),
            ]),
        );
    });

    it('should return 400 if body is empty', async () => {
        const response = await request(app).post('/login').send({});

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request');
        expect(response.body).toHaveProperty(
            'errors',
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['name'],
                }),
                expect.objectContaining({
                    path: ['password'],
                }),
            ]),
        );
    });

    it('should return 401 and Invalid credentials if user not found', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(ApiError.invalidCredentials());

        const response = await request(app).post('/login').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
        expect(response.body).toHaveProperty('errors', []);
    });

    it('should return 401 and Invalid credentials if password is incorrect', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(ApiError.invalidCredentials());

        const response = await request(app).post('/login').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
        expect(response.body).toHaveProperty('errors', []);
    });

    it('should return 500 on unexpected error', async () => {
        jest.spyOn(AuthService.prototype, 'login').mockRejectedValue(
            new Error('Database exploded'),
        );

        const response = await request(app).post('/login').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(500);

        expect(response.body).toHaveProperty('message', 'Unknown error');
    });
});
