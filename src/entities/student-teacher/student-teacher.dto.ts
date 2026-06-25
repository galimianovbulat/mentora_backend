import { z } from 'zod';

export const createLinkDto = z.object({
    studentId: z.number(),
    teacherId: z.number(),
});

export type CreateLinkDto = z.infer<typeof createLinkDto>;
