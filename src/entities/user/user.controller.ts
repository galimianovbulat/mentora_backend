import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { getPayloadFromToken } from './functions';
import { createUserDto } from './user.dto';
import { UserService } from './user.service';

const userService = new UserService();

export async function createUser(req: Request, res: Response): Promise<void> {
    try {
        const dto = createUserDto.parse(req.body);
        const user = await userService.createUser(dto);
        res.json(user);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: error.issues,
            });

            return;
        }

        if (error instanceof Error && error.message === 'User already exists') {
            res.status(409).json({
                message: error.message,
            });

            return;
        }

        res.status(500).json({
            message: 'Internal server error',
        });
    }
}

export function getMe(req: Request, res: Response): void {
    const authHeader = req.headers.authorization; 

    if (!authHeader) {
        res.status(401).json({
            message: 'Unauthorized',
        });

        return;
    }

    const token = authHeader.replace('Bearer ', '');

    const payload = getPayloadFromToken(token);

    res.json(payload);
}
