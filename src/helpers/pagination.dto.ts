import { z } from 'zod/v4';

export const paginationDtoSchema = z.object({
    skip: z.coerce.number(),
    take: z.coerce.number(),
});
