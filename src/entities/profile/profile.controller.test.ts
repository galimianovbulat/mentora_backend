import type { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';

import { USER_ROLE } from '../user/constants';
import { DISCIPLINE, EXAM_TYPE, SCHOOL_GRADE } from './constants';
import { createMyProfile, getMyProfile } from './profile.controller';
import type { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import type { StudentProfile } from './student-profile.entity';
import { StudentProfileService } from './student-profile.service';
import type { TeacherProfile } from './teacher-profile.entity';
import { TeacherProfileService } from './teacher-profile.service';

describe('ProfileController', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMyProfile', () => {
        it('should return my profile', async () => {
            const profile = {
                id: 1,
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                surName: 'Smith',
            } as Profile;
            const teacherProfile = {
                id: 1,
                userId: 1,
                discipline: [DISCIPLINE.MATH],
                examType: [EXAM_TYPE.EGE],
                schoolGrade: [SCHOOL_GRADE.GRADE_9],
            } as TeacherProfile;

            const getProfileByUserIdMock = jest
                .spyOn(ProfileService.prototype, 'getProfileByUserId')
                .mockResolvedValue(profile);
            const getTeacherProfileByUserIdMock = jest.spyOn(
                TeacherProfileService.prototype,
                'getTeacherProfileByUserId',
            );
            const getStudentProfileByUserIdMock = jest.spyOn(
                StudentProfileService.prototype,
                'getStudentProfileByUserId',
            );

            getTeacherProfileByUserIdMock.mockResolvedValue(teacherProfile);
            getStudentProfileByUserIdMock.mockResolvedValue(null);

            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.TEACHER,
                },
            } as Request;
            const res = {
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await getMyProfile(req, res, next);

            expect(getProfileByUserIdMock).toHaveBeenCalledWith(1);
            expect(getTeacherProfileByUserIdMock).toHaveBeenCalledWith(1);
            expect(getStudentProfileByUserIdMock).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                profile: {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    surName: profile.surName,
                },
                teacherProfile: {
                    discipline: teacherProfile.discipline,
                    examType: teacherProfile.examType,
                    schoolGrade: teacherProfile.schoolGrade,
                },
                studentProfile: undefined,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next on unexpected error', async () => {
            const error = new Error('Database exploded');

            jest.spyOn(ProfileService.prototype, 'getProfileByUserId').mockRejectedValue(error);
            jest.spyOn(
                TeacherProfileService.prototype,
                'getTeacherProfileByUserId',
            ).mockResolvedValue(null);
            jest.spyOn(
                StudentProfileService.prototype,
                'getStudentProfileByUserId',
            ).mockResolvedValue(null);

            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.TEACHER,
                },
            } as Request;
            const res = {
                json: jest.fn(),
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await getMyProfile(req, res, next);

            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createMyProfile', () => {
        it('should create teacher profile', async () => {
            const profile = {
                id: 1,
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                surName: 'Smith',
            } as Profile;
            const teacherProfile = {
                id: 1,
                userId: 1,
                discipline: [DISCIPLINE.MATH],
                examType: [EXAM_TYPE.EGE],
                schoolGrade: [SCHOOL_GRADE.GRADE_9],
            } as TeacherProfile;

            const createProfileMock = jest
                .spyOn(ProfileService.prototype, 'createProfile')
                .mockResolvedValue(profile);
            const createTeacherProfileMock = jest
                .spyOn(TeacherProfileService.prototype, 'createTeacherProfile')
                .mockResolvedValue(teacherProfile);

            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.TEACHER,
                },
                body: {
                    firstName: 'John',
                    lastName: 'Doe',
                    surName: 'Smith',
                    discipline: [DISCIPLINE.MATH],
                    examType: [EXAM_TYPE.EGE],
                    schoolGrade: [SCHOOL_GRADE.GRADE_9],
                },
            } as Request;
            const statusMock = jest.fn().mockReturnThis();
            const jsonMock = jest.fn();
            const res = {
                status: statusMock,
                json: jsonMock,
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await createMyProfile(req, res, next);

            expect(createProfileMock).toHaveBeenCalledWith({
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                surName: 'Smith',
                discipline: [DISCIPLINE.MATH],
                examType: [EXAM_TYPE.EGE],
                schoolGrade: [SCHOOL_GRADE.GRADE_9],
            });
            expect(createTeacherProfileMock).toHaveBeenCalledWith({
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                surName: 'Smith',
                discipline: [DISCIPLINE.MATH],
                examType: [EXAM_TYPE.EGE],
                schoolGrade: [SCHOOL_GRADE.GRADE_9],
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                profile: {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    surName: profile.surName,
                },
                teacherProfile: {
                    discipline: teacherProfile.discipline,
                    examType: teacherProfile.examType,
                    schoolGrade: teacherProfile.schoolGrade,
                },
                studentProfile: undefined,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should create student profile', async () => {
            const profile = {
                id: 1,
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                surName: null,
            } as Profile;
            const studentProfile = {
                id: 1,
                userId: 1,
                schoolGrade: SCHOOL_GRADE.GRADE_9,
            } as StudentProfile;

            const createProfileMock = jest
                .spyOn(ProfileService.prototype, 'createProfile')
                .mockResolvedValue(profile);
            const createStudentProfileMock = jest
                .spyOn(StudentProfileService.prototype, 'createStudentProfile')
                .mockResolvedValue(studentProfile);

            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.STUDENT,
                },
                body: {
                    firstName: 'John',
                    lastName: 'Doe',
                    schoolGrade: SCHOOL_GRADE.GRADE_9,
                },
            } as Request;
            const statusMock = jest.fn().mockReturnThis();
            const jsonMock = jest.fn();
            const res = {
                status: statusMock,
                json: jsonMock,
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await createMyProfile(req, res, next);

            expect(createProfileMock).toHaveBeenCalledWith({
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                schoolGrade: SCHOOL_GRADE.GRADE_9,
            });
            expect(createStudentProfileMock).toHaveBeenCalledWith({
                userId: 1,
                firstName: 'John',
                lastName: 'Doe',
                schoolGrade: SCHOOL_GRADE.GRADE_9,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                profile: {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    surName: profile.surName,
                },
                teacherProfile: undefined,
                studentProfile: {
                    schoolGrade: studentProfile.schoolGrade,
                },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with forbidden error if user is not teacher or student', async () => {
            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.ADMIN,
                },
                body: {},
            } as Request;
            const statusMock = jest.fn().mockReturnThis();
            const jsonMock = jest.fn();
            const res = {
                status: statusMock,
                json: jsonMock,
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await createMyProfile(req, res, next);

            expect(statusMock).not.toHaveBeenCalled();
            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 403,
                    message: 'Forbidden',
                    errors: [],
                } satisfies Partial<ApiError>),
            );
        });

        it('should call next with bad request error if teacher body is invalid', async () => {
            const createProfileMock = jest.spyOn(ProfileService.prototype, 'createProfile');
            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.TEACHER,
                },
                body: {
                    firstName: 'John',
                    lastName: 'Doe',
                    examType: [EXAM_TYPE.EGE],
                    schoolGrade: [SCHOOL_GRADE.GRADE_9],
                },
            } as Request;
            const statusMock = jest.fn().mockReturnThis();
            const jsonMock = jest.fn();
            const res = {
                status: statusMock,
                json: jsonMock,
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await createMyProfile(req, res, next);

            expect(createProfileMock).not.toHaveBeenCalled();
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
                        path: ['discipline'],
                    }),
                ]),
            );
        });

        it('should call next on unexpected error', async () => {
            const error = new Error('Database exploded');

            jest.spyOn(ProfileService.prototype, 'createProfile').mockRejectedValue(error);
            jest.spyOn(TeacherProfileService.prototype, 'createTeacherProfile').mockResolvedValue(
                null,
            );

            const req = {
                user: {
                    id: 1,
                    role: USER_ROLE.TEACHER,
                },
                body: {
                    firstName: 'John',
                    lastName: 'Doe',
                    discipline: [DISCIPLINE.MATH],
                    examType: [EXAM_TYPE.EGE],
                    schoolGrade: [SCHOOL_GRADE.GRADE_9],
                },
            } as Request;
            const statusMock = jest.fn().mockReturnThis();
            const jsonMock = jest.fn();
            const res = {
                status: statusMock,
                json: jsonMock,
            } as unknown as Response;
            const next = jest.fn() as jest.MockedFunction<NextFunction>;

            await createMyProfile(req, res, next);

            expect(statusMock).not.toHaveBeenCalled();
            expect(jsonMock).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
