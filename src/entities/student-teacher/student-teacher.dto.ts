import { z } from 'zod';

export const createLink = z.object({
    studentId: z.number(),
    teacherId: z.number(),
});

export type CreateLink = z.infer<typeof createLink>;
