import type { NextFunction, Request, Response } from 'express';

import { ApiError } from './api-error';
import { UNKNOWN_ERROR_MESSAGE } from './constants';

export function errorMiddleware(err: Error, __req: Request, res: Response, __next: NextFunction): void {
    if (err instanceof ApiError) {
        res.status(err.status).json({
            message: err.message,
            errors: err.errors,
        })

        return;
    }

    res.status(500).json({ message: UNKNOWN_ERROR_MESSAGE});
    
    return;
}
