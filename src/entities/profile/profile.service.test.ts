import type { ApiError } from 'errors/api-error';
import type { Repository } from 'typeorm';

import type { Profile } from './profile.entity';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
    let profileService: ProfileService;

    let findOneMock: jest.Mock;
    let saveMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        findOneMock = jest.fn();
        saveMock = jest.fn();

        const repositoryMock = {
            findOne: findOneMock,
            save: saveMock,
        } as unknown as Repository<Profile>;

        profileService = new ProfileService(repositoryMock);
    });

    it('should get profile by user id', async () => {
        const profile = {
            id: 1,
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: 'Smith',
        } as Profile;

        findOneMock.mockResolvedValue(profile);

        const result = await profileService.getProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toEqual(profile);
    });

    it('should return null if profile not found by user id', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await profileService.getProfileByUserId(1);

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(result).toBeNull();
    });

    it('should throw error if profile already exists', async () => {
        findOneMock.mockResolvedValue({
            id: 1,
            userId: 1,
        });

        const result = profileService.createProfile({
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: 'Smith',
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

    it('should create profile if profile does not exist', async () => {
        const createdProfile = {
            id: 1,
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: 'Smith',
        } as Profile;

        findOneMock.mockResolvedValue(null);
        saveMock.mockResolvedValue(createdProfile);

        const result = await profileService.createProfile({
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: 'Smith',
        });

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(saveMock).toHaveBeenCalledWith({
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: 'Smith',
        });

        expect(result).toEqual(createdProfile);
    });

    it('should create profile with null surname if surname is not provided', async () => {
        const createdProfile = {
            id: 1,
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: null,
        } as Profile;

        findOneMock.mockResolvedValue(null);
        saveMock.mockResolvedValue(createdProfile);

        const result = await profileService.createProfile({
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
        });

        expect(findOneMock).toHaveBeenCalledWith({
            where: {
                userId: 1,
            },
        });

        expect(saveMock).toHaveBeenCalledWith({
            userId: 1,
            firstName: 'John',
            lastName: 'Doe',
            surName: null,
        });

        expect(result).toEqual(createdProfile);
    });
});
