import { paginationDtoSchema } from 'helpers/pagination.dto';
import { z } from 'zod';

import { USER_ROLE } from './constants';

export const getUsersDto = paginationDtoSchema.extend({
    name: z.string().optional(),
});

export type GetUsersDto = z.infer<typeof getUsersDto>;

export const payloadDto = z.object({
    id: z.number(),
    role: z.enum(USER_ROLE),
});

export type PayloadDto = z.infer<typeof payloadDto>;

export const createUserDto = z.object({
    name: z.string(),
    password: z.string(),
    role: z.enum(USER_ROLE),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
