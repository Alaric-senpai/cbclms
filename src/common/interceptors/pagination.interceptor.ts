import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { PaginationResult } from '../interfaces/pagination-result.interface';

/**
 * PaginationInterceptor: standardizes pagination responses.
 * If a handler returns an object shaped { data, meta } it passes through.
 * If a handler returns an array and the request contains page/limit query params,
 * it will wrap it into { data, meta } using the provided page/limit and total=data.length.
 * Services that use PrismaService.paginate already return the correct shape.
 */
@Injectable()
export class PaginationInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const page = Number(req.query?.page ?? 1);
        const limit = Number(req.query?.limit ?? 0);

        return next.handle().pipe(
            map((result) => {
                // If already a pagination result, pass through
                if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
                    return result as PaginationResult<any>;
                }

                // If result is an array and page/limit were provided (or defaults), wrap it.
                if (Array.isArray(result) && (req.query?.page !== undefined || req.query?.limit !== undefined)) {
                    const meta = {
                        total: result.length,
                        page: isNaN(page) ? 1 : page,
                        limit: isNaN(limit) || limit === 0 ? result.length : limit,
                        totalPages: 1,
                    };
                    return { data: result, meta } as PaginationResult<any>;
                }

                // Otherwise return as-is
                return result;
            }),
        );
    }
}
