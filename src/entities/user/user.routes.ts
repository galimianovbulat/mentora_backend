import { Router } from 'express';

import { createUser } from './user.controller';

export const userRouter = Router();

userRouter.post('/', createUser);
