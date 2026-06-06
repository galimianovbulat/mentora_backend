import type {
    Request,
    Response,
} from 'express';
import {
    ZodError,
} from 'zod';

import {
    createUserDto,
} from './user.dto';
import {
    UserService,
} from './user.service';

const userService = new UserService();

export async function createUser(req: Request, res: Response): Promise<void> {
    console.log('CREATE USER HIT');
    console.log(req.body);
    try {
        const dto = createUserDto.parse(req.body);
        const user = await userService.createUser(dto);
        res.json(user);
    }
    catch(error) {
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
