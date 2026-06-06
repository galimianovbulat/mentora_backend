// import type {
//     Repository,
// } from 'typeorm';
import { app } from 'app';
import request from 'supertest';

import {
    USER_ROLE,
} from './constants';
// import type {
//     User,
// } from './user.entity';
// import {
//     UserService,
// } from './user.service';

describe('POST /user', () => {
    // let userService: UserService;
    
    // let findOneMock: jest.Mock;
    // let saveMock: jest.Mock;

    // beforeEach(() => {
    //     jest.clearAllMocks();
    
    //     findOneMock = jest.fn();
    //     saveMock = jest.fn();
    
    //     const repositoryMock = {
    //         findOne: findOneMock,
    //         save: saveMock,
    //     } as unknown as Repository<User>;
    
    //     userService = new UserService(repositoryMock);
    // });

    // it('should return 201 and create user', async () => {
    //     const user = {
    //         id: 1,
    //         name: 'admin',
    //         password: 'password',
    //         role: USER_ROLE.ADMIN,
    //         createdAt: new Date(),
    //     } as User;

    //     findOneMock.mockResolvedValue(user);


    // });
    it('should return 400 if body has not password', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'admin',
                role: USER_ROLE.ADMIN,
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body has not name', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                password: 'password',
                role: USER_ROLE.ADMIN,
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });

    it('should return 400 if body has not role', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'admin',
                password: 'password',
            });

        expect(response.status).toBe(400);

        expect(response.body).toHaveProperty('message', 'Invalid request body');
    });
});
