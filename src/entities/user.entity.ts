import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { USER_NAME_MAX_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_ROLE } from './constants';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', {
        length: USER_NAME_MAX_LENGTH,
    })
    name!: string;

    @Column('varchar', {
        length: USER_PASSWORD_MAX_LENGTH,
    })
    password!: string;

    @Column('enum', {
        enum: USER_ROLE,
    })
    role!: USER_ROLE;
}
