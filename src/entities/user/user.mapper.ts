import type { User } from './user.entity';
import type { IPublicUser } from './user.response';

export function toPublicUser(user: User): IPublicUser {
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
    }
}
