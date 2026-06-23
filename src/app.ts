import cors from 'cors';
import { authRoute } from 'entities/auth/auth.route';
import { AUTH_ROUTE } from 'entities/auth/constants';
import { PROFILE_ROUTE } from 'entities/profile/constants';
import { profileRouter } from 'entities/profile/profile.routes';
import { USER_ROUTE } from 'entities/user/constants';
import { userRouter } from 'entities/user/user.routes';
import { errorMiddleware } from 'errors/error-middleware';
import express from 'express';

export const app = express();

app.use(express.json());
app.use(cors());

app.use(`/${USER_ROUTE}`, userRouter);
app.use(`/${AUTH_ROUTE}`, authRoute);
app.use(`/${PROFILE_ROUTE}`, profileRouter);

app.use(errorMiddleware);
