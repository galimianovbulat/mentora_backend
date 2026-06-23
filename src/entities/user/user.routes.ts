import { authMiddleware } from 'entities/auth/auth-middleware';
import { Router } from 'express';

import { USER_ROLE } from './constants';
import { createUser, getMe, getUsers } from './user.controller';

export const userRouter = Router();

userRouter.post('/', authMiddleware([USER_ROLE.ADMIN]), createUser);
userRouter.get('/me', authMiddleware(), getMe);
userRouter.get('/', authMiddleware([USER_ROLE.ADMIN]), getUsers);
