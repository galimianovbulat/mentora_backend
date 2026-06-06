import type {
    Request,
    Response,
} from 'express';

import {
    UserService,
} from './user.service';
import type {
    ICreateUser,
} from './user.types';

const userService = new UserService();

export async function createUser(req: Request, res: Response): Promise<void> {
    console.log('CREATE USER HIT');
    console.log(req.body);
    try {
        const body = req.body as ICreateUser;
        const user = await userService.createUser(body);
        res.json(user);
    }
    catch(e) {
        res.status(500).json(e);
    }
}
