import { Router } from 'express';

import { createUser, getMe } from './user.controller';

export const userRouter = Router();

userRouter.post('/', createUser);
userRouter.get('/me', getMe);
