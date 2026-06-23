import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DISCIPLINE, EXAM_TYPE, SCHOOL_GRADE } from './constants';

@Entity()
export class TeacherProfile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int', {
        unique: true,
    })
    userId!: number;

    @Column('enum', {
        enum: DISCIPLINE,
        array: true,
    })
    discipline!: DISCIPLINE[];

    @Column('enum', {
        enum: EXAM_TYPE,
        array: true,
    })
    examType!: EXAM_TYPE[];

    @Column('enum', {
        enum: SCHOOL_GRADE,
        array: true,
    })
    schoolGrade!: SCHOOL_GRADE[];
}
