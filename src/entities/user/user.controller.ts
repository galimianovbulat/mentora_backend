import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { getPayloadFromToken } from './functions';
import { createUserDto } from './user.dto';
import { UserService } from './user.service';

const userService = new UserService();

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = createUserDto.parse(req.body);
        const user = await userService.createUser(dto);
        res.json(user);
    } catch (error) {
        if (error instanceof ZodError) {
            next(ApiError.badRequest(error.issues));

            return;
        }

        next(error);
    }
}

export function getMe(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization ?? ''; 

        const token = authHeader.replace('Bearer ', '');

        const payload = getPayloadFromToken(token);

        res.json(payload);
    } catch(error) {
        next(error);
    }
}
