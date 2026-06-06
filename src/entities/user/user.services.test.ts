import type {
    Repository,
} from 'typeorm';

import {
    USER_ROLE,
} from './constants';
import type {
    User,
} from './user.entity';
import {
    UserService,
} from './user.service';

jest.mock('helpers/hash-password', () => ({
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
    let userService: UserService;

    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        findOneMock = jest.fn();
        saveMock = jest.fn();

        const repositoryMock = {
            findOne: findOneMock,
            save: saveMock,
        } as unknown as Repository<User>;

        userService = new UserService(repositoryMock);
    });

    it('should get user by name', async () => {
        const user = {
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
            createdAt: new Date(),
        } as User;

        findOneMock.mockResolvedValue(user);

        const result = await userService.getUserByName('admin');

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                name: 'admin',
            },
        });

        expect(result).toEqual(user);
    });

    it('should return null if user not found by name', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await userService.getUserByName('unknown');

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                name: 'unknown',
            },
        });

        expect(result).toBeNull();
    });

    it('should throw error if user already exists', async () => {
        findOneMock.mockResolvedValue({
            id: 1,
            name: 'admin',
        });

        await expect(
            userService.createUser({
                name: 'admin',
                password: '123456',
                role: USER_ROLE.ADMIN,
            }),
        ).rejects.toThrow('User already exists');

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('should create user if user does not exist', async () => {
        const createdUser = {
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
            createdAt: new Date(),
        } as User;

        findOneMock.mockResolvedValue(null);
        saveMock.mockResolvedValue(createdUser);

        const result = await userService.createUser({
            name: 'admin',
            password: '123456',
            role: USER_ROLE.ADMIN,
        });

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                name: 'admin',
            },
        });

        expect(saveMock).toHaveBeenCalledWith({
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
        });

        expect(result).toEqual(createdUser);
    });
});
