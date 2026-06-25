import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Index(['studentId'])
@Index(['teacherId'])
@Entity()
@Unique(['studentId', 'teacherId'])
export class StudentTeacherLink {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    studentId!: number;

    @Column('int')
    teacherId!: number;

    @Column({
        default: true,
    })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
