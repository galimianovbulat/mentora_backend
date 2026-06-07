import { Router } from 'express';

import { login } from './auth.controller';

export const authRoute = Router();

authRoute.post('/', login);
