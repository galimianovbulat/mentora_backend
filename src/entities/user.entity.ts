import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {
    USER_PASSWORD_MAX_LENGTH,
} from './constants';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', {
        length: USER_PASSWORD_MAX_LENGTH,
    })
    password!: string;
}
