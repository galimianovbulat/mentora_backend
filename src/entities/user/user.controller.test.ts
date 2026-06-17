import { app } from 'app';
import { ApiError } from 'errors/api-error';
import request from 'supertest';

import { USER_ROLE } from './constants';
import * as userFunctions from './functions';
import type { User } from './user.entity';
import { UserService } from './user.service';

describe('POST /user', () => {
    beforeEach(() => {
        jest.restoreAllMocks();

        jest.spyOn(userFunctions, 'getPayloadFromToken').mockReturnValue({
            id: 1,
            role: USER_ROLE.ADMIN,
        });
    });

    it('should return 200 and create user', async () => {
        const user = {
            id: 1,
            name: 'admin',
            role: USER_ROLE.ADMIN,
            createdAt: new Date(),
        } as User;

        jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue(user);

        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                name: 'admin',
                password: 'password',
                role: USER_ROLE.ADMIN,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', user.name);
        expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 if body has not password', async () => {
        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                name: 'admin',
                role: USER_ROLE.ADMIN,
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
        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                password: 'password',
                role: USER_ROLE.ADMIN,
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

    it('should return 400 if body has not role', async () => {
        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                name: 'admin',
                password: 'password',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid request');
        expect(response.body).toHaveProperty(
            'errors',
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['role'],
                }),
            ]),
        );
    });

    it('should return 401 if user already exists', async () => {
        jest.spyOn(UserService.prototype, 'createUser').mockRejectedValue(
            ApiError.alreadyExist('User'),
        );

        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                name: 'admin',
                password: 'password',
                role: USER_ROLE.ADMIN,
            });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: 'User already exists',
            errors: [],
        });
    });

    it('should return 500 on unexpected error', async () => {
        jest.spyOn(UserService.prototype, 'createUser').mockRejectedValue(
            new Error('Database exploded'),
        );

        const response = await request(app)
            .post('/user')
            .set('Authorization', 'Bearer access-token')
            .send({
                name: 'admin',
                password: 'password',
                role: USER_ROLE.ADMIN,
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Unknown error',
        });
    });
});

describe('GET /user/me', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should return 401 if authorization header is missing', async () => {
        const response = await request(app).get('/user/me');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized');
        expect(response.body).toHaveProperty('errors', []);
    });

    it('should return payload if token is valid', async () => {
        jest.spyOn(userFunctions, 'getPayloadFromToken').mockReturnValue({
            id: 1,
            role: USER_ROLE.ADMIN,
        });

        const response = await request(app)
            .get('/user/me')
            .set('Authorization', 'Bearer access-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            role: USER_ROLE.ADMIN,
        });
    });
});
