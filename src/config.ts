export default {
    PORT: Number(process.env.PORT),

    DB_PORT: Number(process.env.DB_PORT),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? '',
};
