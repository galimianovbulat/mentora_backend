import { authMiddleware } from 'entities/auth/auth-middleware';
import { USER_ROLE } from 'entities/user/constants';
import { Router } from 'express';

import { createMyProfile, getMyProfile } from './profile.controller';

export const profileRouter = Router();

profileRouter.get('/me', authMiddleware(), getMyProfile);
profileRouter.post('/', authMiddleware([USER_ROLE.TEACHER, USER_ROLE.STUDENT]), createMyProfile);
