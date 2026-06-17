import type { ApiError } from 'errors/api-error';
import { hashPassword } from 'helpers/bcrypt';
import type { Repository } from 'typeorm';

import { USER_ROLE } from './constants';
import type { User } from './user.entity';
import { UserService } from './user.service';

jest.mock('helpers/bcrypt', () => ({
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

    it('should get public user by name without password', async () => {
        const createdAt = new Date();
        const user = {
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
            createdAt,
        } as User;

        findOneMock.mockResolvedValue(user);

        const result = await userService.getPublicUserByName('admin');

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                name: 'admin',
            },
        });

        expect(result).toEqual({
            id: user.id,
            name: user.name,
            role: user.role,
            createdAt,
        });
        expect(result).not.toHaveProperty('password');
    });

    it('should throw error if user not found by name', async () => {
        findOneMock.mockResolvedValue(null);

        await expect(userService.getPublicUserByName('name')).rejects.toMatchObject({
            status: 401,
            message: 'User not found',
            errors: [],
        } satisfies Partial<ApiError>);
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

        const result = userService.createUser({
            name: 'admin',
            password: '123456',
            role: USER_ROLE.ADMIN,
        });

        await expect(result).rejects.toMatchObject({
            status: 401,
            message: 'User already exists',
            errors: [],
        } satisfies Partial<ApiError>);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                name: 'admin',
            },
        });
        expect(hashPassword).not.toHaveBeenCalled();
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('should create user if user does not exist', async () => {
        const createdAt = new Date();
        const createdUser = {
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
            createdAt,
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

        expect(hashPassword).toHaveBeenCalledWith('123456');
        expect(saveMock).toHaveBeenCalledWith({
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
        });

        expect(result).toEqual({
            id: createdUser.id,
            name: createdUser.name,
            role: createdUser.role,
            createdAt,
        });
        expect(result).not.toHaveProperty('password');
    });
});
