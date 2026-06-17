import { AppDataSource } from 'data-source';
import { ApiError } from 'errors/api-error';
import { hashPassword } from 'helpers/bcrypt';

import type { CreateUserDto } from './user.dto';
import { User } from './user.entity';
import { toPublicUser } from './user.mapper';
import type { IPublicUser } from './user.response';

export class UserService {
    public constructor(private readonly userRepository = AppDataSource.getRepository(User)) {}

    public async getUserByName(name: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {
                name,
            },
        });
    }

    public async getPublicUserByName(name: string): Promise<IPublicUser | null> {
        const user = await this.userRepository.findOne({
            where: {
                name,
            },
        });

        if (!user) {
            throw ApiError.notFound('User');
        }

        return toPublicUser(user);
    }

    public async createUser(dto: CreateUserDto): Promise<IPublicUser> {
        const existingUser = await this.getUserByName(dto.name);

        if (existingUser) {
            throw ApiError.alreadyExist('User');
        }

        const passwordHash = await hashPassword(dto.password);

        const user = await this.userRepository.save({
            name: dto.name,
            password: passwordHash,
            role: dto.role,
        });

        return toPublicUser(user);
    }
}
