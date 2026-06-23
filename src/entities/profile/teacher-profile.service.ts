import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';

import type { CreateTeacherProfileDto } from './profile.dto';
import { TeacherProfile } from './teacher-profile.entity';

export class TeacherProfileService {
    public constructor(
        private readonly teacherProfileRepository = AppDataSource.getRepository(TeacherProfile),
    ) {}

    public async getTeacherProfileByUserId(userId: number): Promise<TeacherProfile | null> {
        return this.teacherProfileRepository.findOne({
            where: {
                userId,
            },
        });
    }

    public async createTeacherProfile(
        dto: CreateTeacherProfileDto,
    ): Promise<TeacherProfile | null> {
        const existingProfile = await this.getTeacherProfileByUserId(dto.userId);

        if (existingProfile) {
            throw ApiError.alreadyExist('Profile');
        }

        return await this.teacherProfileRepository.save({
            userId: dto.userId,
            discipline: dto.discipline,
            examType: dto.examType,
            schoolGrade: dto.schoolGrade,
        });
    }
}
