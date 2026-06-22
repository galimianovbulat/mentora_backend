import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { SCHOOL_GRADE } from './constants';


@Entity()
export class StudentProfile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('number', {
        unique: true,
    })
    userId!: number;

    @Column('enum', {
        enum: SCHOOL_GRADE,
    })
    schoolGrade!: SCHOOL_GRADE;
}
