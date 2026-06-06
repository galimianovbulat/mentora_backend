import {
    CREATE_USER_ROUTE,
} from 'entities/user/constants';
import {
    userRouter,
} from 'entities/user/user.routes';
import express from 'express';

export const app = express();

app.use(express.json());

app.use(`/${CREATE_USER_ROUTE}`, userRouter);
