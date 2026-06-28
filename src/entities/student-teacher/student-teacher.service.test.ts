import { ApiError } from 'errors/api-error';
import type { Repository } from 'typeorm';

import type { StudentTeacherLink } from './student-teacher.entity';
import { StudentTeacherLinkService } from './student-teacher.service';

describe('StudentTeacherLinkService', () => {
    let repository: jest.Mocked<
        Pick<Repository<StudentTeacherLink>, 'find' | 'findOne' | 'save' | 'update'>
    >;
    let service: StudentTeacherLinkService;

    beforeEach(() => {
        repository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };

        service = new StudentTeacherLinkService(
            repository as unknown as Repository<StudentTeacherLink>,
        );
    });

    describe('getTeachersListIdByStudentId', () => {
        it('returns teacher ids from active links for the specified student', async () => {
            const links = [
                {
                    teacherId: 20,
                },
                {
                    teacherId: 21,
                },
            ] as StudentTeacherLink[];
            repository.find.mockResolvedValue(links);

            await expect(service.getTeachersListIdByStudentId(10)).resolves.toEqual([20, 21]);
            expect(repository.find).toHaveBeenCalledWith({
                select: {
                    teacherId: true,
                },
                where: {
                    studentId: 10,
                    isActive: true,
                },
            });
        });
    });

    describe('getStudentsListIdByTeacherId', () => {
        it('returns student ids from active links for the specified teacher', async () => {
            const links = [
                {
                    studentId: 10,
                },
                {
                    studentId: 11,
                },
            ] as StudentTeacherLink[];
            repository.find.mockResolvedValue(links);

            await expect(service.getStudentsListIdByTeacherId(20)).resolves.toEqual([10, 11]);
            expect(repository.find).toHaveBeenCalledWith({
                select: {
                    studentId: true,
                },
                where: {
                    teacherId: 20,
                    isActive: true,
                },
            });
        });
    });

    describe('createLink', () => {
        const dto = {
            studentId: 10,
            teacherId: 20,
        };

        it('creates a new active link when one does not exist', async () => {
            const savedLink = {
                id: 1,
                ...dto,
                isActive: true,
                createdAt: new Date(),
            } as StudentTeacherLink;
            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue(savedLink);

            await expect(service.createLink(dto)).resolves.toBe(savedLink);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: dto,
            });
            expect(repository.save).toHaveBeenCalledWith({
                ...dto,
                isActive: true,
            });
        });

        it('reactivates and saves an inactive existing link', async () => {
            const link = {
                id: 1,
                ...dto,
                isActive: false,
                createdAt: new Date(),
            } as StudentTeacherLink;
            repository.findOne.mockResolvedValue(link);
            repository.save.mockResolvedValue(link);

            await expect(service.createLink(dto)).resolves.toBe(link);
            expect(link.isActive).toBe(true);
            expect(repository.save).toHaveBeenCalledWith(link);
        });

        it('throws a conflict error when the link is already active', async () => {
            const link = {
                id: 1,
                ...dto,
                isActive: true,
                createdAt: new Date(),
            } as StudentTeacherLink;
            repository.findOne.mockResolvedValue(link);

            const error = await service
                .createLink(dto)
                .catch((caughtError: unknown) => caughtError);

            expect(error).toBeInstanceOf(ApiError);
            expect(error).toMatchObject({
                status: 409,
                message: 'StudentTeacher link already exists',
            });
            expect(repository.save).not.toHaveBeenCalled();
        });
    });

    describe('deleteLink', () => {
        it('deactivates an existing link', async () => {
            const link = {
                id: 1,
                studentId: 10,
                teacherId: 20,
                isActive: true,
                createdAt: new Date(),
            } as StudentTeacherLink;
            repository.findOne.mockResolvedValue(link);
            repository.update.mockResolvedValue({
                generatedMaps: [],
                raw: [],
                affected: 1,
            });

            await expect(service.deleteLink(1)).resolves.toBeUndefined();
            expect(repository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
            expect(repository.update).toHaveBeenCalledWith(
                {
                    id: 1,
                },
                {
                    isActive: false,
                },
            );
        });

        it('throws a not found error when the link does not exist', async () => {
            repository.findOne.mockResolvedValue(null);

            const error = await service.deleteLink(1).catch((caughtError: unknown) => caughtError);

            expect(error).toBeInstanceOf(ApiError);
            expect(error).toMatchObject({
                status: 404,
                message: 'StudentTeacher link not found',
            });
            expect(repository.update).not.toHaveBeenCalled();
        });
    });
});
