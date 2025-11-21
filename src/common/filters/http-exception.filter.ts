import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        // Default response
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';
        let error = 'InternalServerError';

        // Nest HTTP exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                message = (res as any).message ?? res;
                error = (res as any).error ?? error;
            }
        } else if (exception && typeof exception === 'object') {
            // Prisma errors and other errors often have a `code` or `meta`
            const ex: any = exception;

            // Prisma known request error (e.g., unique constraint)
            if (ex.code) {
                // Common Prisma error codes mapping
                // P2002: Unique constraint failed
                // P2025: An operation failed because it depends on one or more records that were required but not found.
                switch (ex.code) {
                    case 'P2002':
                        status = HttpStatus.CONFLICT;
                        message = ex.meta?.target
                            ? `Unique constraint failed on ${ex.meta.target}`
                            : ex.message ?? 'Unique constraint failed';
                        error = 'Conflict';
                        break;
                    case 'P2025':
                        status = HttpStatus.NOT_FOUND;
                        message = ex.message ?? 'Record not found';
                        error = 'NotFound';
                        break;
                    default:
                        status = HttpStatus.BAD_REQUEST;
                        message = ex.message ?? String(ex);
                        error = ex.name ?? 'BadRequest';
                        break;
                }
            } else if (ex instanceof Error) {
                // Generic Error
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                message = ex.message;
                error = ex.name;
            }
        }

        const payload = {
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request?.url ?? null,
        };

        // Log the original exception for internal debugging
        this.logger.error({ message: payload.message, exception });

        response.status(status).json(payload);
    }
}
