import type {
    Request,
    Response,
} from 'express';

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
    catch(e) {
        res.status(500).json(e);
    }
}
