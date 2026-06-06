import { createUser } from 'entities/user/user.controller';
import { Router } from 'express';

export const userRouter = Router();

userRouter.post('/', createUser);
