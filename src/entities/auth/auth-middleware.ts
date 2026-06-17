import type { PayloadDto } from 'entities/auth/auth.dto';
import type { USER_ROLE } from 'entities/user/constants';
import { getPayloadFromToken } from 'entities/user/functions';
import type { NextFunction, Request, RequestHandler,Response } from 'express';

export function authMiddleware (role?: USER_ROLE): RequestHandler {
    return function(req: Request, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization ?? '';
        const token = authHeader.replace('Bearer ', '');

        let user: PayloadDto;

        try {
            user = getPayloadFromToken(token);
        } catch {
            res.status(401).json({
                message: 'Unauthorized',
            });

            return;
        }

        if (role && user.role !== role) {
            res.status(403).json({
                message: 'Forbidden',
            });

            return;
        }

        next();
    }
}
