import { app } from 'app';
import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';

import { USER_ROLE } from './constants';
import * as userFunctions from './functions';
import { getMe } from './user.controller';
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

describe('GET /user', () => {
    beforeEach(() => {
        jest.restoreAllMocks();

        jest.spyOn(userFunctions, 'getPayloadFromToken').mockReturnValue({
            id: 1,
            role: USER_ROLE.ADMIN,
        });
    });

    it('should return 200 and users list', async () => {
        const createdAt = new Date();
        const users = [
            {
                id: 1,
                name: 'admin',
                password: 'hashed-password',
                role: USER_ROLE.ADMIN,
                createdAt,
            },
        ] as User[];

        const getUsersMock = jest
            .spyOn(UserService.prototype, 'getUsers')
            .mockResolvedValue([users, 1]);

        const response = await request(app)
            .get('/user')
            .set('Authorization', 'Bearer access-token')
            .query({
                skip: 0,
                take: 10,
                name: 'adm',
            });

        expect(response.status).toBe(200);
        expect(getUsersMock).toHaveBeenCalledWith({
            skip: 0,
            take: 10,
            name: 'adm',
        });
        expect(response.body).toEqual({
            users: [
                {
                    id: users[0].id,
                    name: users[0].name,
                    role: users[0].role,
                    createdAt: createdAt.toISOString(),
                },
            ],
            count: 1,
        });
    });

    it('should return 403 if user is not admin', async () => {
        jest.spyOn(userFunctions, 'getPayloadFromToken').mockReturnValue({
            id: 1,
            role: USER_ROLE.STUDENT,
        });

        const getUsersMock = jest.spyOn(UserService.prototype, 'getUsers');

        const response = await request(app)
            .get('/user')
            .set('Authorization', 'Bearer access-token')
            .query({
                skip: 0,
                take: 10,
            });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message', 'Forbidden');
        expect(response.body).toHaveProperty('errors', []);
        expect(getUsersMock).not.toHaveBeenCalled();
    });

    it('should return 500 on unexpected error', async () => {
        jest.spyOn(UserService.prototype, 'getUsers').mockRejectedValue(
            new Error('Database exploded'),
        );

        const response = await request(app)
            .get('/user')
            .set('Authorization', 'Bearer access-token')
            .query({
                skip: 0,
                take: 10,
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

    it('should return 500 if payload parsing fails in controller', async () => {
        jest.spyOn(userFunctions, 'getPayloadFromToken')
            .mockReturnValueOnce({
                id: 1,
                role: USER_ROLE.ADMIN,
            })
            .mockImplementationOnce(() => {
                throw new Error('Invalid payload');
            });

        const response = await request(app)
            .get('/user/me')
            .set('Authorization', 'Bearer access-token');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Unknown error',
        });
    });

    it('should call next if authorization header is missing in controller', () => {
        const error = new Error('Invalid payload');
        const req = {
            headers: {},
        } as Request;
        const res = {
            json: jest.fn(),
        } as unknown as Response;
        const next = jest.fn() as jest.MockedFunction<NextFunction>;

        jest.spyOn(userFunctions, 'getPayloadFromToken').mockImplementation(() => {
            throw error;
        });

        getMe(req, res, next);

        expect(userFunctions.getPayloadFromToken).toHaveBeenCalledWith('');
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(error);
    });
});
