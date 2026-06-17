import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import type { AuthUserDto } from './auth.dto';
import { authUserDto } from './auth.dto';
import { AuthService } from './auth.services';
import type { ITokens } from './types';

const authService = new AuthService();

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto: AuthUserDto = authUserDto.parse(req.body);
        const tokens: ITokens = await authService.login(dto.name, dto.password);
        res.json(tokens);
    } catch (error) {
        if (error instanceof ZodError) {
            next(ApiError.badRequest(error.issues))

            return;
        }

        next(error);
    }
}
