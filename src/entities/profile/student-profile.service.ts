import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';

import type { CreateStudentProfileDto } from './profile.dto';
import { StudentProfile } from './student-profile.entity';

export class StudentProfileService {
    public constructor(
        private readonly studentProfileRepository = AppDataSource.getRepository(StudentProfile),
    ) {}

    public async getStudentProfileByUserId(userId: number): Promise<StudentProfile | null> {
        return this.studentProfileRepository.findOne({
            where: {
                userId,
            },
        });
    }

    public async createStudentProfile(
        dto: CreateStudentProfileDto,
    ): Promise<StudentProfile | null> {
        const existingProfile = await this.getStudentProfileByUserId(dto.userId);

        if (existingProfile) {
            throw ApiError.alreadyExist('Profile');
        }

        return await this.studentProfileRepository.save({
            userId: dto.userId,
            schoolGrade: dto.schoolGrade,
        });
    }
}
