import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { createLinkDto } from './student-teacher.dto';
import { toPublicLink } from './student-teacher.mapper';
import { StudentTeacherLinkService } from './student-teacher.service';

const studentTeacherLinkService = new StudentTeacherLinkService();

export async function createLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = createLinkDto.parse(req.body);
        const link = await studentTeacherLinkService.createLink(dto);

        res.status(201).json(toPublicLink(link));
    } catch (error) {
        if (error instanceof ZodError) {
            next(ApiError.badRequest(error.issues));

            return;
        }

        next(error);
    }
}

export async function getTeachersList(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const studentId = req.user.id;
        const teachersId = await studentTeacherLinkService.getTeachersListIdByStudentId(studentId);

        res.json(teachersId);
    } catch (error) {
        next(error);
    }
}

export async function getStudentsList(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const teacherId = req.user.id;
        const studentsId = await studentTeacherLinkService.getStudentsListIdByTeacherId(teacherId);

        res.json(studentsId);
    } catch (error) {
        next(error);
    }
}
