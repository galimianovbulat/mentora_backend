import type { ApiError } from 'errors/api-error';
import type { Repository } from 'typeorm';

import { SCHOOL_GRADE } from './constants';
import type { StudentProfile } from './student-profile.entity';
import { StudentProfileService } from './student-profile.service';

describe('StudentProfileService', () => {
    let studentProfileService: StudentProfileService;

    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        findOneMock = jest.fn();
        saveMock = jest.fn();

        const repositoryMock = {
            findOne: findOneMock,
            save: saveMock,
        } as unknown as Repository<StudentProfile>;

        studentProfileService = new StudentProfileService(repositoryMock);
    });

    it('should get student profile by user id', async () => {
        const studentProfile = {
            id: 1,
            userId: 1,
            schoolGrade: SCHOOL_GRADE.GRADE_9,
        } as StudentProfile;

        findOneMock.mockResolvedValue(studentProfile);

        const result = await studentProfileService.getStudentProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toEqual(studentProfile);
    });

    it('should return null if student profile not found by user id', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await studentProfileService.getStudentProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toBeNull();
    });

    it('should throw error if student profile already exists', async () => {
        findOneMock.mockResolvedValue({
            id: 1,
            userId: 1,
        });

        const result = studentProfileService.createStudentProfile({
            userId: 1,
            schoolGrade: SCHOOL_GRADE.GRADE_9,
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

    it('should create student profile if student profile does not exist', async () => {
        const createdStudentProfile = {
            id: 1,
            userId: 1,
            schoolGrade: SCHOOL_GRADE.GRADE_9,
        } as StudentProfile;

        findOneMock.mockResolvedValue(null);
        saveMock.mockResolvedValue(createdStudentProfile);

        const result = await studentProfileService.createStudentProfile({
            userId: 1,
            schoolGrade: SCHOOL_GRADE.GRADE_9,
        });

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(saveMock).toHaveBeenCalledWith({
            userId: 1,
            schoolGrade: SCHOOL_GRADE.GRADE_9,
        });

        expect(result).toEqual(createdStudentProfile);
    });
});
