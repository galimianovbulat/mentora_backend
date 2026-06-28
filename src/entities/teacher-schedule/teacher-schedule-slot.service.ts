import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';
import { LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Not } from 'typeorm';

import { DEFAULT_TEACHER_SCHEDULE_DAYS } from './constants';
import type {
    CreateTeacherScheduleSlotDto,
    GetTeacherScheduleSlotsDto,
    UpdateTeacherScheduleSlotDto,
} from './teacher-schedule-slot.dto';
import { TeacherScheduleSlot } from './teacher-schedule-slot.entity';

export class TeacherScheduleSlotService {
    public constructor(
        private readonly teacherScheduleSlotRepository = AppDataSource.getRepository(
            TeacherScheduleSlot,
        ),
    ) {}

    public async createTeacherScheduleSlot(
        teacherId: number,
        dto: CreateTeacherScheduleSlotDto,
    ): Promise<TeacherScheduleSlot> {
        this.validateSlotPeriod(dto.startAt, dto.endAt);

        await this.validateNoOverlappingSlots(teacherId, dto.startAt, dto.endAt);

        return this.teacherScheduleSlotRepository.save({
            teacherId,
            startAt: dto.startAt,
            endAt: dto.endAt,
            isActive: true,
        });
    }

    public async deleteTeacherScheduleSlot(id: number): Promise<void> {
        const slot = await this.getSlotByIdOrFail(id);

        slot.isActive = false;

        await this.teacherScheduleSlotRepository.save(slot);
    }

    public async getTeacherScheduleSlots(
        teacherId: number,
        dto: GetTeacherScheduleSlotsDto,
    ): Promise<TeacherScheduleSlot[]> {
        const from = dto.from ?? new Date();
        const to = dto.to ?? this.addDays(from, DEFAULT_TEACHER_SCHEDULE_DAYS);

        return this.teacherScheduleSlotRepository.find({
            where: {
                teacherId,
                isActive: true,
                startAt: MoreThanOrEqual(from),
                endAt: LessThanOrEqual(to),
            },
            order: {
                startAt: 'ASC',
            },
        });
    }

    public async updateTeacherScheduleSlot(
        id: number,
        dto: UpdateTeacherScheduleSlotDto,
    ): Promise<TeacherScheduleSlot> {
        const slot = await this.getSlotByIdOrFail(id);

        const startAt = dto.startAt ?? slot.startAt;
        const endAt = dto.endAt ?? slot.endAt;

        this.validateSlotPeriod(startAt, endAt);

        await this.validateNoOverlappingSlots(slot.teacherId, startAt, endAt, slot.id);

        slot.startAt = startAt;
        slot.endAt = endAt;

        return this.teacherScheduleSlotRepository.save(slot);
    }

    private async getSlotByIdOrFail(id: number): Promise<TeacherScheduleSlot> {
        const slot = await this.teacherScheduleSlotRepository.findOne({
            where: {
                id,
            },
        });

        if (!slot) {
            throw ApiError.notFound('Teacher schedule slot');
        }

        return slot;
    }

    private validateSlotPeriod(startAt: Date, endAt: Date): void {
        if (startAt >= endAt) {
            throw ApiError.badRequest([
                {
                    message: 'startAt must be earlier than endAt',
                    path: ['startAt', 'endAt'],
                },
            ]);
        }
    }

    private async validateNoOverlappingSlots(
        teacherId: number,
        startAt: Date,
        endAt: Date,
        excludedSlotId?: number,
    ): Promise<void> {
        const overlappingSlot = await this.teacherScheduleSlotRepository.findOne({
            where: {
                id: excludedSlotId ? Not(excludedSlotId) : undefined,
                teacherId,
                isActive: true,
                startAt: LessThan(endAt),
                endAt: MoreThan(startAt),
            },
        });

        if (overlappingSlot) {
            throw ApiError.alreadyExist('Teacher schedule slot');
        }
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);

        result.setDate(result.getDate() + days);

        return result;
    }
}
