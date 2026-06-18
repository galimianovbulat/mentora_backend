import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { getPayloadFromToken } from './functions';
import { createUserDto, getUsersDto } from './user.dto';
import { toPublicUser } from './user.mapper';
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
    } catch (error) {
        next(error);
    }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = getUsersDto.parse(req.query);

        const [users, count] = await userService.getUsers(dto);

        res.json({
            users: users.map(toPublicUser),
            count,
        });
    } catch (error) {
        next(error);
    }
}
