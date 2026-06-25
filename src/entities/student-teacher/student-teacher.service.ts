import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';

import type { CreateLinkDto } from './student-teacher.dto';
import { StudentTeacherLink } from './student-teacher.entity';

export class StudentTeacherLinkService {
    public constructor(
        private readonly StudentTeacherLinkRepository = AppDataSource.getRepository(
            StudentTeacherLink,
        ),
    ) {}

    public async getTeachersListIdByStudentId(studentId: number): Promise<number[]> {
        const links = await this.StudentTeacherLinkRepository.find({
            select: {
                teacherId: true,
            },
            where: {
                studentId,
                isActive: true,
            },
        });

        return links.map((link) => link.teacherId);
    }

    public async getStudentsListIdByTeacherId(teacherId: number): Promise<number[]> {
        const links = await this.StudentTeacherLinkRepository.find({
            select: {
                studentId: true,
            },
            where: {
                teacherId,
                isActive: true,
            },
        });

        return links.map((link) => link.studentId);
    }

    public async createLink(dto: CreateLinkDto): Promise<StudentTeacherLink> {
        const link = await this.StudentTeacherLinkRepository.findOne({
            where: {
                studentId: dto.studentId,
                teacherId: dto.teacherId,
            },
        });

        if (link) {
            if (link.isActive) {
                throw ApiError.alreadyExist('StudentTeacher link');
            }

            link.isActive = true;

            return this.StudentTeacherLinkRepository.save(link);
        }

        return this.StudentTeacherLinkRepository.save({
            studentId: dto.studentId,
            teacherId: dto.teacherId,
            isActive: true,
        });
    }

    public async deleteLink(linkId: number) {
        const link = await this.StudentTeacherLinkRepository.findOne({
            where: {
                id: linkId,
            },
        });

        if (!link) {
            throw ApiError.notFound('StudentTeacher link');
        }

        return this.StudentTeacherLinkRepository.update(
            {
                id: linkId,
            },
            {
                isActive: false,
            },
        );
    }
}
