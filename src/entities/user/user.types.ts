import type { USER_ROLE } from './constants';

export interface ICreateUser {
    name: string;
    password: string;
    role: USER_ROLE;
}
