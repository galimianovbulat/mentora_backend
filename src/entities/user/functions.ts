import config from 'config';
import jwt from 'jsonwebtoken';

import type { PayloadDto } from './user.dto';
import { payloadDto } from './user.dto';

export function getPayloadFromToken(token: string): PayloadDto {
    const payload = payloadDto.parse(jwt.verify(
            token,
            config.JWT_ACCESS_SECRET,
        ))

    return payload;
}
