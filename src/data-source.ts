import config from 'config';
import { Profile } from 'entities/profile/profile.entity';
import { StudentProfile } from 'entities/profile/student-profile.entity';
import { TeacherProfile } from 'entities/profile/teacher-profile.entity';
import { User } from 'entities/user/user.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',

    host: config.DB_HOST,
    port: config.DB_PORT,

    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,

    synchronize: true,

    entities: [User, Profile, TeacherProfile, StudentProfile],
});
