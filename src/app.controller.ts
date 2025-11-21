import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';
import { PaginationQueryDto } from './common/dto/pagination-query.dto';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly prismaService: PrismaService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Example paginated endpoint using PrismaService.paginate.
  @Get('users')
  async listUsers(@Query() q: PaginationQueryDto) {
    // Note: this assumes you have a `User` model in your Prisma schema (this project does).
    // It returns { data: User[], meta: { total, page, limit, totalPages } }
    // Use the prisma client delegate and pass page/limit from query
    return this.prismaService.paginate(this.prismaService.user, { page: q.page, limit: q.limit });
  }



}
