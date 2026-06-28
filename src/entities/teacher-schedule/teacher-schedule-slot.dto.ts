import { z } from 'zod';

export const createTeacherScheduleSlotDto = z.object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
});

export type CreateTeacherScheduleSlotDto = z.infer<typeof createTeacherScheduleSlotDto>;

export const getTeacherScheduleSlotsDto = z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

export type GetTeacherScheduleSlotsDto = z.infer<typeof getTeacherScheduleSlotsDto>;

export const updateTeacherScheduleSlotDto = z.object({
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
}).refine(
    (data) =>
        data.startAt !== undefined ||
        data.endAt !== undefined,
    {
        path: ['startAt'],
        message: 'At least one field must be provided',
    },
);

export type UpdateTeacherScheduleSlotDto = z.infer<typeof updateTeacherScheduleSlotDto>;
