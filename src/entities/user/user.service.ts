import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';
import { hashPassword } from 'helpers/bcrypt';

import type { CreateUserDto, GetUsersDto } from './user.dto';
import { User } from './user.entity';

export class UserService {
    public constructor(private readonly userRepository = AppDataSource.getRepository(User)) {}

    public async getUserByName(name: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                name,
            },
        });
    }

    public async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                id,
            },
        });
    }

    public async getUsers(dto: GetUsersDto): Promise<[User[], number]> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (dto.name) {
            queryBuilder.andWhere('user.name ILIKE :name', {
                name: `%${dto.name}%`,
            });
        }

        return queryBuilder.skip(dto.skip).take(dto.take).getManyAndCount();
    }

    public async createUser(dto: CreateUserDto): Promise<User> {
        const existingUser = await this.getUserByName(dto.name);

        if (existingUser) {
            throw ApiError.alreadyExist('User');
        }

        const passwordHash = await hashPassword(dto.password);

        return this.userRepository.save({
            name: dto.name,
            password: passwordHash,
            role: dto.role,
        });
    }
}
