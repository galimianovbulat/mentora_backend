import type { USER_ROLE } from './constants';

export interface IPublicUser {
    id: number;
    name: string;
    role: USER_ROLE;
    createdAt: Date;
}
