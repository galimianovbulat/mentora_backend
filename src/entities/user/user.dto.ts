import {
    z,
} from 'zod';

import {
    USER_ROLE,
} from './constants';

export const createUserDto = z.object({
    name: z.string(),
    password: z.string(),
    role: z.enum(USER_ROLE),
});

export type CreateUserDto = z.infer<typeof createUserDto>;
