import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';

import type { CreateLink } from './student-teacher.dto';
import { StudentTeacherLink } from './student-teacher.entity';

export class StudentTeacherLinkService {
    public constructor(
        private readonly StudentTeacherLinkRepository = AppDataSource.getRepository(
            StudentTeacherLink,
        ),
    ) {}

    public async getLinksByStudentId(studentId: number): Promise<StudentTeacherLink[]> {
        return this.StudentTeacherLinkRepository.find({
            where: {
                studentId,
                isActive: true,
            },
        });
    }

    public async getLinksByTeacherId(teacherId: number): Promise<StudentTeacherLink[]> {
        return this.StudentTeacherLinkRepository.find({
            where: {
                teacherId,
                isActive: true,
            },
        });
    }

    public async createLink(dto: CreateLink): Promise<StudentTeacherLink> {
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
