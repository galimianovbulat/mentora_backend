import {
    ALREADY_EXIST_MESSAGE,
    BAD_REQUEST_MESSAGE,
    FORBIDDEN_MESSAGE,
    INVALID_CREDENSIALS_MESSAGE,
    NOT_FOUND_MESSAGE,
    UNAUTHORIZED_MESSAGE,
} from './constants';

export class ApiError extends Error {
    public readonly status: number;

    public readonly errors: unknown[];

    public constructor(status: number, message: string, errors: unknown[] = []) {
        super(message);

        this.status = status;
        this.errors = errors;
    }

    public static badRequest(errors: unknown[] = []): ApiError {
        return new ApiError(400, BAD_REQUEST_MESSAGE, errors);
    }

    public static unauthorized(): ApiError {
        return new ApiError(401, UNAUTHORIZED_MESSAGE);
    }

    public static forbidden(): ApiError {
        return new ApiError(403, FORBIDDEN_MESSAGE);
    }

    public static invalidCredentials(): ApiError {
        return new ApiError(401, INVALID_CREDENSIALS_MESSAGE);
    }

    public static notFound(entityName: string): ApiError {
        return new ApiError(401, `${entityName} ${NOT_FOUND_MESSAGE}`);
    }

    public static alreadyExist(entityName: string): ApiError {
        return new ApiError(401, `${entityName} ${ALREADY_EXIST_MESSAGE}`);
    }
}
