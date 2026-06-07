import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import type { AuthUserDto } from './auth.dto';
import { authUserDto } from './auth.dto';
import { AuthService } from './auth.services';
import type { ITokens } from './types';

const authService = new AuthService();

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const dto: AuthUserDto = authUserDto.parse(req.body);
        const tokens: ITokens = await authService.login(dto.name, dto.password);
        res.json(tokens);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: error.issues,
            });

            return;
        }

        if (error instanceof Error && error.message === 'User not found') {
            res.status(401).json({
                message: error.message,
            });

            return;
        }

        if (error instanceof Error && error.message === 'Incorrect password') {
            res.status(401).json({
                message: error.message,
            });

            return;
        }

        res.status(500).json({
            message: 'Internal server error',
        });
    }
}
