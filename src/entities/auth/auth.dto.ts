import { USER_ROLE } from 'entities/user/constants';
import { z } from 'zod';

export const authUserDto = z.object({
    name: z.string(),
    password: z.string(),
});

export type AuthUserDto = z.infer<typeof authUserDto>;

export const payloadDto = z.object({
    id: z.number(),
    role: z.enum(USER_ROLE),
});

export type PayloadDto = z.infer<typeof payloadDto>;
