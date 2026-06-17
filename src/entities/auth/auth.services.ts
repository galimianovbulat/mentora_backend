import config from 'config';
import { UserService } from 'entities/user/user.service';
import { ApiError } from 'errors/api-error';
import { isPassEquals } from 'helpers/bcrypt';
import jwt from 'jsonwebtoken';

import type { PayloadDto } from './auth.dto';
import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } from './constants';
import type { ITokens } from './types';

export class AuthService {
    public constructor(private readonly userService = new UserService()) {}

    public generateToken(payload: PayloadDto): ITokens {
        const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
            expiresIn: ACCESS_TOKEN_LIFETIME,
        });

        const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_LIFETIME,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    public async login(username: string, password: string): Promise<ITokens> {
        const user = await this.userService.getUserByName(username);

        if (!user) {
            throw ApiError.invalidCredentials();
        }

        const isEquals = await isPassEquals(password, user.password);

        if (!isEquals) {
            throw ApiError.invalidCredentials();
        }

        return this.generateToken({
            id: user.id,
            role: user.role,
        });
    }
}
