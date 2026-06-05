import { DataSource } from 'typeorm';

import config from './config';
import { User } from './entities/user.entity';

export const AppDataSource = new DataSource({
    type: 'postgres',

    host: config.DB_HOST,
    port: config.DB_PORT,

    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,

    synchronize: true,

    entities: [User],
});
