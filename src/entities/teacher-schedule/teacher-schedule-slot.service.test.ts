import type { ApiError } from 'errors/api-error';
import type { Repository } from 'typeorm';

import { DEFAULT_TEACHER_SCHEDULE_DAYS } from './constants';
import type { TeacherScheduleSlot } from './teacher-schedule-slot.entity';
import { TeacherScheduleSlotService } from './teacher-schedule-slot.service';

describe('TeacherScheduleSlotService', () => {
    let repository: jest.Mocked<Pick<Repository<TeacherScheduleSlot>, 'find' | 'findOne' | 'save'>>;
    let service: TeacherScheduleSlotService;

    const teacherId = 20;
    const startAt = new Date('2026-07-01T10:00:00.000Z');
    const endAt = new Date('2026-07-01T11:00:00.000Z');

    const getLastFindOneWhere = (): Record<string, unknown> => {
        const lastCall = repository.findOne.mock.calls.at(-1);

        expect(lastCall).toBeDefined();

        const [options] = lastCall as [
            {
                where: Record<string, unknown>;
            },
        ];

        return options.where;
    };

    const getLastFindOptions = (): {
        where: Record<string, unknown>;
        order: Record<string, unknown>;
    } => {
        const lastCall = repository.find.mock.calls.at(-1);

        expect(lastCall).toBeDefined();

        const [options] = lastCall as [
            {
                where: Record<string, unknown>;
                order: Record<string, unknown>;
            },
        ];

        return options;
    };

    const expectFindOperator = (operator: unknown, type: string, value: unknown): void => {
        expect(operator).toMatchObject({
            type,
            value,
        });
    };

    beforeEach(() => {
        repository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
        };

        service = new TeacherScheduleSlotService(
            repository as unknown as Repository<TeacherScheduleSlot>,
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('createTeacherScheduleSlot', () => {
        it('creates an active slot when period is valid and there are no overlaps', async () => {
            const savedSlot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue(savedSlot);

            await expect(
                service.createTeacherScheduleSlot(teacherId, {
                    startAt,
                    endAt,
                }),
            ).resolves.toBe(savedSlot);

            expect(repository.findOne).toHaveBeenCalledTimes(1);
            expect(getLastFindOneWhere()).toMatchObject({
                id: undefined,
                teacherId,
                isActive: true,
            });
            expectFindOperator(getLastFindOneWhere().startAt, 'lessThan', endAt);
            expectFindOperator(getLastFindOneWhere().endAt, 'moreThan', startAt);
            expect(repository.save).toHaveBeenCalledWith({
                teacherId,
                startAt,
                endAt,
                isActive: true,
            });
        });

        it('throws a bad request error when startAt is not earlier than endAt', async () => {
            const result = service.createTeacherScheduleSlot(teacherId, {
                startAt: endAt,
                endAt,
            });

            await expect(result).rejects.toMatchObject({
                status: 400,
                errors: [
                    {
                        message: 'startAt must be earlier than endAt',
                        path: ['startAt', 'endAt'],
                    },
                ],
            });
            expect(repository.findOne).not.toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('throws a conflict error when an active slot overlaps the requested period', async () => {
            repository.findOne.mockResolvedValue({
                id: 1,
                teacherId,
                startAt: new Date('2026-07-01T10:30:00.000Z'),
                endAt: new Date('2026-07-01T11:30:00.000Z'),
                isActive: true,
            });

            const result = service.createTeacherScheduleSlot(teacherId, {
                startAt,
                endAt,
            });

            await expect(result).rejects.toMatchObject({
                status: 409,
                message: 'Teacher schedule slot already exists',
                errors: [],
            });
            expect(repository.save).not.toHaveBeenCalled();
        });
    });

    describe('deleteTeacherScheduleSlot', () => {
        it('deactivates an existing slot', async () => {
            const slot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            repository.findOne.mockResolvedValue(slot);
            repository.save.mockResolvedValue(slot);

            await expect(service.deleteTeacherScheduleSlot(1)).resolves.toBeUndefined();

            expect(repository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                },
            });
            expect(slot.isActive).toBe(false);
            expect(repository.save).toHaveBeenCalledWith(slot);
        });

        it('throws a not found error when the slot does not exist', async () => {
            repository.findOne.mockResolvedValue(null);

            const result = service.deleteTeacherScheduleSlot(1);

            await expect(result).rejects.toMatchObject({
                status: 404,
                message: 'Teacher schedule slot not found',
                errors: [],
            } satisfies Partial<ApiError>);
            expect(repository.save).not.toHaveBeenCalled();
        });
    });

    describe('getTeacherScheduleSlots', () => {
        it('returns active slots for teacher within the specified period ordered by startAt', async () => {
            const slots = [
                {
                    id: 1,
                    teacherId,
                    startAt,
                    endAt,
                    isActive: true,
                },
            ] as TeacherScheduleSlot[];
            const from = new Date('2026-07-01T00:00:00.000Z');
            const to = new Date('2026-07-07T00:00:00.000Z');
            repository.find.mockResolvedValue(slots);

            await expect(
                service.getTeacherScheduleSlots(teacherId, {
                    from,
                    to,
                }),
            ).resolves.toBe(slots);

            const options = getLastFindOptions();

            expect(options.where).toMatchObject({
                teacherId,
                isActive: true,
            });
            expectFindOperator(options.where.startAt, 'moreThanOrEqual', from);
            expectFindOperator(options.where.endAt, 'lessThanOrEqual', to);
            expect(options.order).toEqual({
                startAt: 'ASC',
            });
        });

        it('uses current date and default schedule period when filters are not provided', async () => {
            const now = new Date('2026-07-01T00:00:00.000Z');
            const defaultTo = new Date(now);

            defaultTo.setDate(defaultTo.getDate() + DEFAULT_TEACHER_SCHEDULE_DAYS);
            jest.useFakeTimers().setSystemTime(now);
            repository.find.mockResolvedValue([]);

            await expect(service.getTeacherScheduleSlots(teacherId, {})).resolves.toEqual([]);

            const options = getLastFindOptions();

            expect(options.where).toMatchObject({
                teacherId,
                isActive: true,
            });
            expectFindOperator(options.where.startAt, 'moreThanOrEqual', now);
            expectFindOperator(options.where.endAt, 'lessThanOrEqual', defaultTo);
            expect(options.order).toEqual({
                startAt: 'ASC',
            });
        });
    });

    describe('updateTeacherScheduleSlot', () => {
        it('updates an existing slot and excludes it from overlap validation', async () => {
            const slot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            const updatedStartAt = new Date('2026-07-01T12:00:00.000Z');
            const updatedEndAt = new Date('2026-07-01T13:00:00.000Z');
            repository.findOne.mockResolvedValueOnce(slot).mockResolvedValueOnce(null);
            repository.save.mockResolvedValue(slot);

            await expect(
                service.updateTeacherScheduleSlot(1, {
                    startAt: updatedStartAt,
                    endAt: updatedEndAt,
                }),
            ).resolves.toBe(slot);

            expect(repository.findOne).toHaveBeenNthCalledWith(1, {
                where: {
                    id: 1,
                },
            });
            expect(getLastFindOneWhere()).toMatchObject({
                teacherId,
                isActive: true,
            });
            expectFindOperator(getLastFindOneWhere().id, 'not', 1);
            expectFindOperator(getLastFindOneWhere().startAt, 'lessThan', updatedEndAt);
            expectFindOperator(getLastFindOneWhere().endAt, 'moreThan', updatedStartAt);
            expect(slot).toMatchObject({
                startAt: updatedStartAt,
                endAt: updatedEndAt,
            });
            expect(repository.save).toHaveBeenCalledWith(slot);
        });

        it('uses current slot values for fields that are not provided', async () => {
            const slot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            const updatedEndAt = new Date('2026-07-01T12:00:00.000Z');
            repository.findOne.mockResolvedValueOnce(slot).mockResolvedValueOnce(null);
            repository.save.mockResolvedValue(slot);

            await service.updateTeacherScheduleSlot(1, {
                endAt: updatedEndAt,
            });

            expectFindOperator(getLastFindOneWhere().startAt, 'lessThan', updatedEndAt);
            expectFindOperator(getLastFindOneWhere().endAt, 'moreThan', startAt);
            expect(slot).toMatchObject({
                startAt,
                endAt: updatedEndAt,
            });
        });

        it('throws a not found error when the slot does not exist', async () => {
            repository.findOne.mockResolvedValue(null);

            const result = service.updateTeacherScheduleSlot(1, {
                endAt: new Date('2026-07-01T12:00:00.000Z'),
            });

            await expect(result).rejects.toMatchObject({
                status: 404,
                message: 'Teacher schedule slot not found',
                errors: [],
            } satisfies Partial<ApiError>);
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('throws a bad request error when updated period is invalid', async () => {
            const slot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            repository.findOne.mockResolvedValue(slot);

            const result = service.updateTeacherScheduleSlot(1, {
                startAt: endAt,
            });

            await expect(result).rejects.toMatchObject({
                status: 400,
            });
            expect(repository.findOne).toHaveBeenCalledTimes(1);
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('throws a conflict error when updated period overlaps another active slot', async () => {
            const slot = {
                id: 1,
                teacherId,
                startAt,
                endAt,
                isActive: true,
            } as TeacherScheduleSlot;
            const overlappingSlot = {
                id: 2,
                teacherId,
                startAt: new Date('2026-07-01T12:30:00.000Z'),
                endAt: new Date('2026-07-01T13:30:00.000Z'),
                isActive: true,
            } as TeacherScheduleSlot;
            repository.findOne.mockResolvedValueOnce(slot).mockResolvedValueOnce(overlappingSlot);

            const result = service.updateTeacherScheduleSlot(1, {
                startAt: new Date('2026-07-01T12:00:00.000Z'),
                endAt: new Date('2026-07-01T13:00:00.000Z'),
            });

            await expect(result).rejects.toMatchObject({
                status: 409,
                message: 'Teacher schedule slot already exists',
                errors: [],
            } satisfies Partial<ApiError>);
            expect(repository.save).not.toHaveBeenCalled();
        });
    });
});
