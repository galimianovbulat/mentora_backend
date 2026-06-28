import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Check('"startAt" < "endAt"')
export class TeacherScheduleSlot {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    teacherId!: number;

    @Column('timestamp')
    startAt!: Date;

    @Column('timestamp')
    endAt!: Date;

    @Column('boolean', {
        default: true,
    })
    isActive!: boolean;
}
