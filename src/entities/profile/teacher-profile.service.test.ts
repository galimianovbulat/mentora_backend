import type { ApiError } from 'errors/api-error';
import type { Repository } from 'typeorm';

import { DISCIPLINE, EXAM_TYPE, SCHOOL_GRADE } from './constants';
import type { TeacherProfile } from './teacher-profile.entity';
import { ProfileService as TeacherProfileService } from './teacher-profile.service';

describe('TeacherProfileService', () => {
    let teacherProfileService: TeacherProfileService;

    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        findOneMock = jest.fn();
        saveMock = jest.fn();

        const repositoryMock = {
            findOne: findOneMock,
            save: saveMock,
        } as unknown as Repository<TeacherProfile>;

        teacherProfileService = new TeacherProfileService(repositoryMock);
    });

    it('should get teacher profile by user id', async () => {
        const teacherProfile = {
            id: 1,
            userId: 1,
            discipline: [DISCIPLINE.MATH],
            examType: [EXAM_TYPE.EGE],
            schoolGrade: [SCHOOL_GRADE.GRADE_9],
        } as TeacherProfile;

        findOneMock.mockResolvedValue(teacherProfile);

        const result = await teacherProfileService.getTeacherProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toEqual(teacherProfile);
    });

    it('should return null if teacher profile not found by user id', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await teacherProfileService.getTeacherProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toBeNull();
    });

    it('should throw error if teacher profile already exists', async () => {
        findOneMock.mockResolvedValue({
            id: 1,
            userId: 1,
        });

        const result = teacherProfileService.createTeacherProfile({
            userId: 1,
            discipline: [DISCIPLINE.MATH],
            examType: [EXAM_TYPE.EGE],
            schoolGrade: [SCHOOL_GRADE.GRADE_9],
        });

        await expect(result).rejects.toMatchObject({
            status: 409,
            message: 'Profile already exists',
            errors: [],
        } satisfies Partial<ApiError>);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('should create teacher profile if teacher profile does not exist', async () => {
        const createdTeacherProfile = {
            id: 1,
            userId: 1,
            discipline: [DISCIPLINE.MATH],
            examType: [EXAM_TYPE.EGE],
            schoolGrade: [SCHOOL_GRADE.GRADE_9],
        } as TeacherProfile;

        findOneMock.mockResolvedValue(null);
        saveMock.mockResolvedValue(createdTeacherProfile);

        const result = await teacherProfileService.createTeacherProfile({
            userId: 1,
            discipline: [DISCIPLINE.MATH],
            examType: [EXAM_TYPE.EGE],
            schoolGrade: [SCHOOL_GRADE.GRADE_9],
        });

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(saveMock).toHaveBeenCalledWith({
            userId: 1,
            discipline: [DISCIPLINE.MATH],
            examType: [EXAM_TYPE.EGE],
            schoolGrade: [SCHOOL_GRADE.GRADE_9],
        });

        expect(result).toEqual(createdTeacherProfile);
    });
});
