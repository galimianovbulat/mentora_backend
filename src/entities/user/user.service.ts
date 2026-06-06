import { AppDataSource } from 'data-source';
import { hashPassword } from 'helpers/hash-password';
import type { Repository } from 'typeorm';

import type {
    CreateUserDto,
} from './user.dto';
import { User } from './user.entity';


export class UserService {
    protected getRepository(): Repository<User> {
        return AppDataSource.getRepository(User);
    }

    public async getUserByName(name: string): Promise<User | null> {
        return this.getRepository().findOne({
            where: {
                name,
            },
        });
    }

    public async createUser(dto: CreateUserDto): Promise<User> {
        const existingUser = await this.getUserByName(dto.name);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const passwordHash = await hashPassword(dto.password);

        const user = await this.getRepository().save({
            name: dto.name,
            password: passwordHash,
            role: dto.role,
        });

        return user;
    }
}
