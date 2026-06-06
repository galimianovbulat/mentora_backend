import 'dotenv/config';

import { CREATE_USER_ROUTE } from 'entities/user/constants';
import { userRouter } from 'entities/user/user.routes';
import express from 'express';

import config from './config';
import { AppDataSource } from './data-source';

const app = express();

app.use(express.json());

app.use(`/${CREATE_USER_ROUTE}`, userRouter);

void (async function () {
    await AppDataSource.initialize();
    console.log('DB is here!');

    app.listen(config.PORT, () => {
        console.log(`Server started on ${String(config.PORT)}`);
    });
})();
