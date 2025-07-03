import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RateLimiterInterceptor } from './common/interceptors/rate-limiter.interceptor';
import { initializeDatabase } from './dbconfig';

async function bootstrap() {
  // Initialize database first
  await initializeDatabase();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global pipes, filters, and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new RateLimiterInterceptor(configService),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Production Backend')
    .setDescription('Production-grade NestJS backend with offline-first sync')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('workspaces', 'Workspace management')
    .addTag('table-schemas', 'Table schema management')
    .addTag('field-schemas', 'Field schema management')
    .addTag('relationships', 'Table relationships')
    .addTag('data-rows', 'Data row operations')
    .addTag('sync', 'Offline sync endpoints')
    .addTag('files', 'File management')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();