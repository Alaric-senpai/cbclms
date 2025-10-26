import {Global, Module} from '@nestjs/common';
import {PrismaService} from "@/core/prisma/prisma.service";

/**
 * THis was created by charles [Alaric-senpai]
 * Welcome to prisma core module.
 * Functionalities:
 * 1. Extend Prisma Client
 * 2. Globally injectable service
 */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
