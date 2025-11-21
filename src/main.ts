import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PaginationInterceptor } from './common/interceptors/pagination.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { requestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe: transforms and validates incoming requests.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Ensure each request has a correlation id and basic request logging
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // Global pagination/response-shaping interceptor
  app.useGlobalInterceptors(new PaginationInterceptor(new Reflector()));

  // Global exception filter (catches HttpException, Prisma errors, generic errors)
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
