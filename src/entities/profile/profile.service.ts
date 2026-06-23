import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';

import type { CreateProfileDto } from './profile.dto';
import { Profile } from './profile.entity';

export class ProfileService {
    public constructor(private readonly profileRepository = AppDataSource.getRepository(Profile)) {}

    public async getProfileByUserId(userId: number): Promise<Profile | null> {
        return this.profileRepository.findOne({
            where: {
                userId,
            },
        });
    }

    public async createProfile(dto: CreateProfileDto): Promise<Profile | null> {
        const existingProfile = await this.getProfileByUserId(dto.userId);

        if (existingProfile) {
            throw ApiError.alreadyExist('Profile');
        }

        return await this.profileRepository.save({
            userId: dto.userId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            surName: dto.surName ?? null,
        });
    }
}
