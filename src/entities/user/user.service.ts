import { AppDataSource } from 'data-source';
import { hashPassword } from 'helpers/hash-password';
import type { Repository } from 'typeorm';

import { User } from './user.entity';
import type { ICreateUser } from './user.types';

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

    public async createUser(rawUser: ICreateUser): Promise<User> {
        const existingUser = await this.getUserByName(rawUser.name);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const passwordHash = await hashPassword(rawUser.password);

        const user = await this.getRepository().save({
            name: rawUser.name,
            password: passwordHash,
            role: rawUser.role,
        });

        return user;
    }
}
