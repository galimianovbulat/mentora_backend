import { authMiddleware } from 'entities/auth/auth-middleware';
import { USER_ROLE } from 'entities/user/constants';
import { Router } from 'express';

import { createLink, getStudentsList, getTeachersList } from './student-teacher.controller';

export const studentTeacherRouter = Router();

studentTeacherRouter.get('/my-teachers', authMiddleware([USER_ROLE.STUDENT]), getTeachersList);
studentTeacherRouter.get('/my-students', authMiddleware([USER_ROLE.TEACHER]), getStudentsList);
studentTeacherRouter.post('/student-teachers', authMiddleware([USER_ROLE.ADMIN]), createLink);
