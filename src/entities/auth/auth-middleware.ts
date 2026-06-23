import type { USER_ROLE } from 'entities/user/constants';
import { getPayloadFromToken } from 'entities/user/functions';
import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function authMiddleware(roles?: USER_ROLE[]): RequestHandler {
    return function (req: Request, _res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization ?? '';
        const token = authHeader.replace('Bearer ', '');

        try {
            req.user = getPayloadFromToken(token);
        } catch {
            next(ApiError.unauthorized());

            return;
        }

        if (roles && !roles.includes(req.user.role)) {
            next(ApiError.forbidden());

            return;
        }

        next();
    };
}
