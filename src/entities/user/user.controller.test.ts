import { app } from 'app';
import request from 'supertest';

import { USER_ROLE } from './constants';
import type { User } from './user.entity';
import { UserService } from './user.service';

describe('POST /user', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and create user', async () => {
        const user = {
            id: 1,
            name: 'admin',
            role: USER_ROLE.ADMIN,
            createdAt: new Date(),
        } as User;

        jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue(user);

        const response = await request(app).post('/user').send({
            name: 'admin',
            password: 'password',
            role: USER_ROLE.ADMIN,
        });

        expect(response.status).toBe(200);

        expect(response.body).toHaveProperty('name', user.name);
        expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 if body has not password', async () => {
        const response = await request(app).post('/user').send({
            name: 'admin',
            role: USER_ROLE.ADMIN,
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body has not name', async () => {
        const response = await request(app).post('/user').send({
            password: 'password',
            role: USER_ROLE.ADMIN,
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body has not role', async () => {
        const response = await request(app).post('/user').send({
            name: 'admin',
            password: 'password',
        });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 200 and create user', async () => {
        jest.spyOn(UserService.prototype, 'createUser').mockRejectedValue(
            new Error('User already exists'),
        );

        const response = await request(app).post('/user').send({
            name: 'admin',
            password: 'password',
            role: USER_ROLE.ADMIN,
        });

        expect(response.status).toBe(409);

        expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should return 500 on unexpected error', async () => {
        jest.spyOn(UserService.prototype, 'createUser').mockRejectedValue(
            new Error('Database exploded'),
        );

        const response = await request(app).post('/user').send({
            name: 'admin',
            password: 'password',
            role: USER_ROLE.ADMIN,
        });

        expect(response.status).toBe(500);

        expect(response.body).toHaveProperty('message', 'Internal server error');
    });
});
