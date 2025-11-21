import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {




    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    /**
     * Generic paginate helper for Prisma delegates.
     * Usage: return this.paginate(this.user, { where, page, limit, orderBy })
     */
    async paginate<T = any>(
        delegate: { findMany: Function; count: Function },
        options: {
            where?: any;
            page?: number;
            limit?: number;
            orderBy?: any;
            select?: any;
            include?: any;
        } = {},
    ): Promise<PaginationResult<T>> {
        const page = Math.max(1, options.page ?? 1);
        const limit = Math.min(100, options.limit ?? 20);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            delegate.findMany({
                where: options.where,
                take: limit,
                skip,
                orderBy: options.orderBy,
                select: options.select,
                include: options.include,
            }),
            delegate.count({ where: options.where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }
}
