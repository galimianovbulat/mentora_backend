import { USER_ROLE } from 'entities/user/constants';
import { ApiError } from 'errors/api-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { createFullStudentProfileDto, createFullTeacherProfileDto } from './profile.dto';
import { toMyProfileResponse } from './profile.mapper';
import { ProfileService } from './profile.service';
import { StudentProfileService } from './student-profile.service';
import { TeacherProfileService } from './teacher-profile.service';

const profileService = new ProfileService();
const studentProfileService = new StudentProfileService();
const teacherProfileService = new TeacherProfileService();

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user.id;
        const [profile, teacherProfile, studentProfile] = await Promise.all([
            profileService.getProfileByUserId(userId),
            teacherProfileService.getTeacherProfileByUserId(userId),
            studentProfileService.getStudentProfileByUserId(userId),
        ]);
        res.json(
            toMyProfileResponse(
                profile,
                teacherProfile,
                studentProfile,
            ),
        );
    } catch (error) {
        next(error);
    }
}

export async function createMyProfile(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole === USER_ROLE.TEACHER) {
            const dto = createFullTeacherProfileDto.parse({
                ...req.body,
                userId,
            });

            const [profile, teacherProfile] = await Promise.all([
                profileService.createProfile(dto),
                teacherProfileService.createTeacherProfile(dto),
            ]);

            res.status(201).json(toMyProfileResponse(profile, teacherProfile, null));

            return;
        }

        if (userRole === USER_ROLE.STUDENT) {
            const dto = createFullStudentProfileDto.parse({
                ...req.body,
                userId,
            });

            const [profile, studentProfile] = await Promise.all([
                profileService.createProfile(dto),
                studentProfileService.createStudentProfile(dto),
            ]);

            res.status(201).json(toMyProfileResponse(profile, null, studentProfile));

            return;
        }

        next(ApiError.forbidden());
    } catch (error) {
        if (error instanceof ZodError) {
            next(ApiError.badRequest(error.issues));

            return;
        }

        next(error);
    }
}
