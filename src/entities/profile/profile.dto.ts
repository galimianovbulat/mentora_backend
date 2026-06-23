import { z } from 'zod';

import { DISCIPLINE, EXAM_TYPE, SCHOOL_GRADE } from './constants';

const baseProfileDto = z.object({
    userId: z.number(),
});

export const createProfileDto = baseProfileDto.extend({
    firstName: z.string(),
    lastName: z.string(),
    surName: z.string().optional(),
});

export type CreateProfileDto = z.infer<typeof createProfileDto>;

export const createTeacherProfileDto = baseProfileDto.extend({
    discipline: z.array(z.enum(DISCIPLINE)),
    examType: z.array(z.enum(EXAM_TYPE)),
    schoolGrade: z.array(z.enum(SCHOOL_GRADE)),
});

export type CreateTeacherProfileDto = z.infer<typeof createTeacherProfileDto>;

export const createStudentProfileDto = baseProfileDto.extend({
    schoolGrade: z.enum(SCHOOL_GRADE),
});

export type CreateStudentProfileDto = z.infer<typeof createStudentProfileDto>;
