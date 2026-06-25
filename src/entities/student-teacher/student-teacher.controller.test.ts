import type { NextFunction, Request, Response } from 'express';

import { USER_ROLE } from '../user/constants';
import { createLink, getStudentsList, getTeachersList } from './student-teacher.controller';
import type { StudentTeacherLink } from './student-teacher.entity';
import { StudentTeacherLinkService } from './student-teacher.service';

describe('StudentTeacherLinkController', () => {
    let res: Response;
    let next: jest.MockedFunction<NextFunction>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.restoreAllMocks();

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        } as unknown as Response;
        next = jest.fn() as jest.MockedFunction<NextFunction>;
    });

    describe('createLink', () => {
        it('creates a link and returns its public fields with status 201', async () => {
            const link = {
                id: 1,
                studentId: 10,
                teacherId: 20,
                isActive: true,
                createdAt: new Date(),
            } as StudentTeacherLink;
            const createLinkMock = jest
                .spyOn(StudentTeacherLinkService.prototype, 'createLink')
                .mockResolvedValue(link);
            const req = {
                body: {
                    studentId: 10,
                    teacherId: 20,
                },
            } as Request;

            await createLink(req, res, next);

            expect(createLinkMock).toHaveBeenCalledWith({
                studentId: 10,
                teacherId: 20,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                studentId: 10,
                teacherId: 20,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('passes a bad request error to next when body is invalid', async () => {
            const createLinkMock = jest.spyOn(StudentTeacherLinkService.prototype, 'createLink');
            const req = {
                body: {
                    studentId: 10,
                },
            } as Request;

            await createLink(req, res, next);

            expect(createLinkMock).not.toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 400,
                    message: 'Invalid request',
                }),
            );
            expect(next.mock.calls[0]?.[0]).toHaveProperty(
                'errors',
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ['teacherId'],
                    }),
                ]),
            );
        });

        it('passes service errors to next', async () => {
            const error = new Error('Database exploded');
            jest.spyOn(StudentTeacherLinkService.prototype, 'createLink').mockRejectedValue(error);
            const req = {
                body: {
                    studentId: 10,
                    teacherId: 20,
                },
            } as Request;

            await createLink(req, res, next);

            expect(statusMock).not.toHaveBeenCalled();
            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getTeachersList', () => {
        it('returns teacher ids for the authenticated student', async () => {
            const getTeachersMock = jest
                .spyOn(StudentTeacherLinkService.prototype, 'getTeachersListIdByStudentId')
                .mockResolvedValue([20, 21]);
            const req = {
                user: {
                    id: 10,
                    role: USER_ROLE.STUDENT,
                },
            } as Request;

            await getTeachersList(req, res, next);

            expect(getTeachersMock).toHaveBeenCalledWith(10);
            expect(jsonMock).toHaveBeenCalledWith([20, 21]);
            expect(next).not.toHaveBeenCalled();
        });

        it('passes service errors to next', async () => {
            const error = new Error('Database exploded');
            jest.spyOn(
                StudentTeacherLinkService.prototype,
                'getTeachersListIdByStudentId',
            ).mockRejectedValue(error);
            const req = {
                user: {
                    id: 10,
                    role: USER_ROLE.STUDENT,
                },
            } as Request;

            await getTeachersList(req, res, next);

            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getStudentsList', () => {
        it('returns student ids for the authenticated teacher', async () => {
            const getStudentsMock = jest
                .spyOn(StudentTeacherLinkService.prototype, 'getStudentsListIdByTeacherId')
                .mockResolvedValue([10, 11]);
            const req = {
                user: {
                    id: 20,
                    role: USER_ROLE.TEACHER,
                },
            } as Request;

            await getStudentsList(req, res, next);

            expect(getStudentsMock).toHaveBeenCalledWith(20);
            expect(jsonMock).toHaveBeenCalledWith([10, 11]);
            expect(next).not.toHaveBeenCalled();
        });

        it('passes service errors to next', async () => {
            const error = new Error('Database exploded');
            jest.spyOn(
                StudentTeacherLinkService.prototype,
                'getStudentsListIdByTeacherId',
            ).mockRejectedValue(error);
            const req = {
                user: {
                    id: 20,
                    role: USER_ROLE.TEACHER,
                },
            } as Request;

            await getStudentsList(req, res, next);

            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
