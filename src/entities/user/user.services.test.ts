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
    let createQueryBuilderMock: jest.Mock;
    let andWhereMock: jest.Mock;
    let skipMock: jest.Mock;
    let takeMock: jest.Mock;
    let getManyAndCountMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        findOneMock = jest.fn();
        saveMock = jest.fn();
        createQueryBuilderMock = jest.fn();
        andWhereMock = jest.fn();
        skipMock = jest.fn();
        takeMock = jest.fn();
        getManyAndCountMock = jest.fn();

        const queryBuilderMock = {
            andWhere: andWhereMock,
            skip: skipMock,
            take: takeMock,
            getManyAndCount: getManyAndCountMock,
        };

        createQueryBuilderMock.mockReturnValue(queryBuilderMock);
        andWhereMock.mockReturnValue(queryBuilderMock);
        skipMock.mockReturnValue(queryBuilderMock);
        takeMock.mockReturnValue(queryBuilderMock);

        const repositoryMock = {
            findOne: findOneMock,
            save: saveMock,
            createQueryBuilder: createQueryBuilderMock,
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

    it('should get user by id', async () => {
        const user = {
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
            createdAt: new Date(),
        } as User;

        findOneMock.mockResolvedValue(user);

        const result = await userService.getUserById(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
        });

        expect(result).toEqual(user);
    });

    it('should return null if user not found by id', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await userService.getUserById(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                id: 1,
            },
        });

        expect(result).toBeNull();
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

    it('should get users without name filter', async () => {
        const users = [
            {
                id: 1,
                name: 'admin',
                password: 'hashed-password',
                role: USER_ROLE.ADMIN,
                createdAt: new Date(),
            },
        ] as User[];

        getManyAndCountMock.mockResolvedValue([users, 1]);

        const result = await userService.getUsers({
            skip: 0,
            take: 10,
        });

        expect(createQueryBuilderMock).toHaveBeenCalledWith('user');
        expect(andWhereMock).not.toHaveBeenCalled();
        expect(skipMock).toHaveBeenCalledWith(0);
        expect(takeMock).toHaveBeenCalledWith(10);
        expect(getManyAndCountMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual([users, 1]);
    });

    it('should get users with name filter', async () => {
        const users = [
            {
                id: 1,
                name: 'admin',
                password: 'hashed-password',
                role: USER_ROLE.ADMIN,
                createdAt: new Date(),
            },
        ] as User[];

        getManyAndCountMock.mockResolvedValue([users, 1]);

        const result = await userService.getUsers({
            skip: 10,
            take: 20,
            name: 'adm',
        });

        expect(createQueryBuilderMock).toHaveBeenCalledWith('user');
        expect(andWhereMock).toHaveBeenCalledWith('user.name ILIKE :name', {
            name: '%adm%',
        });
        expect(skipMock).toHaveBeenCalledWith(10);
        expect(takeMock).toHaveBeenCalledWith(20);
        expect(getManyAndCountMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual([users, 1]);
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
            status: 409,
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

        expect(result).toEqual(createdUser);
    });
});
