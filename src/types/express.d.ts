import type { PayloadDto } from 'entities/auth/auth.dto';

declare global {
    namespace Express {
        interface Request {
            user: PayloadDto;
        }
    }
}
