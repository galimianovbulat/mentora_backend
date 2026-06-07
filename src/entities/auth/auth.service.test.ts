import {
    USER_ROLE,
} from 'entities/user/constants';
import type {
    UserService,
} from 'entities/user/user.service';
import {
    isPassEquals,
} from 'helpers/bcrypt';
import jwt from 'jsonwebtoken';

import {
    AuthService,
} from './auth.services';

jest.mock('helpers/bcrypt', () => ({
    isPassEquals: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('token'),
}));

describe('AuthServices', () => {
    let getUserByNameMock: jest.Mock;
    let userServiceMock: UserService;
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();

        getUserByNameMock = jest.fn();

        userServiceMock = {
            getUserByName: getUserByNameMock,
        } as unknown as UserService;

        authService = new AuthService(userServiceMock);
    });

    it('should throw if user not found', async () => {
        getUserByNameMock.mockResolvedValue(null);

        await expect(
            authService.login('admin', 'password'),
        ).rejects.toThrow('User not found');
    });

    it('should throw if password is incorrect', async () => {
        getUserByNameMock.mockResolvedValue({
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
        });

        jest.mocked(isPassEquals)
            .mockResolvedValue(false);

        await expect(
            authService.login('admin', 'password'),
        ).rejects.toThrow('Incorrect password');
    });

    it('should return tokens if login is successful', async () => {
        getUserByNameMock.mockResolvedValue({
            id: 1,
            name: 'admin',
            password: 'hashed-password',
            role: USER_ROLE.ADMIN,
        });

        jest.mocked(isPassEquals)
            .mockResolvedValue(true);

        const result = await authService.login(
            'admin',
            'password',
        );

        expect(getUserByNameMock).toHaveBeenCalledWith('admin');

        expect(isPassEquals).toHaveBeenCalledWith(
            'password',
            'hashed-password',
        );

        expect(result).toEqual({
            accessToken: 'token',
            refreshToken: 'token',
        });
    });

    it('should generate access and refresh tokens', () => {
        const result = authService.generateToken({
            id: 1,
            role: USER_ROLE.ADMIN,
        });

        expect(jwt.sign).toHaveBeenCalledTimes(2);

        expect(result).toEqual({
            accessToken: 'token',
            refreshToken: 'token',
        });
    });
});
