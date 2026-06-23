import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MAX_NAME_LENGTH } from './constants';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int', {
        unique: true,
    })
    userId!: number;

    @Column('varchar', {
        length: MAX_NAME_LENGTH,
    })
    firstName!: string;

    @Column('varchar', {
        length: MAX_NAME_LENGTH,
    })
    lastName!: string;

    @Column('varchar', {
        length: MAX_NAME_LENGTH,
        nullable: true,
    })
    surName!: string | null;

    @CreateDateColumn()
    createdAt!: Date;
}
