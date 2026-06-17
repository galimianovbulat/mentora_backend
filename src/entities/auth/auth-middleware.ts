import type { PayloadDto } from 'entities/auth/auth.dto';
import type { USER_ROLE } from 'entities/user/constants';
import { getPayloadFromToken } from 'entities/user/functions';
import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function authMiddleware(role?: USER_ROLE): RequestHandler {
    return function (req: Request, __res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization ?? '';
        const token = authHeader.replace('Bearer ', '');

        let user: PayloadDto;

        try {
            user = getPayloadFromToken(token);
        } catch {
            next(ApiError.unauthorized());

            return;
        }

        if (role && user.role !== role) {
            next(ApiError.forbidden());

            return;
        }

        next();
    };
}
