/* eslint-disable prettier/prettier */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Built-in NestJS HTTP request logger (logs method, URL, status, response time)
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });

  // ─── Security Headers (Helmet) ─────────────────────────────────────────────
  // Sets HTTP response headers to protect from well-known web vulnerabilities:
  // XSS, clickjacking, MIME sniffing, etc.
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // allow Swagger UI assets to load
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // required for Swagger UI
          imgSrc: ["'self'", 'data:', 'https:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  // ─── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: '*', // tighten in production with specific origins
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  // ─── Global Prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  // ─── Global Interceptors ───────────────────────────────────────────────────
  // Enables @Exclude() / @Expose() on response DTOs via class-transformer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ─── Config ────────────────────────────────────────────────────────────────
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // ─── Swagger ───────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Restaurant Backend API')
    .setDescription(
      'REST API for the restaurant SaaS platform.\n\n' +
      '**Rate limit:** 60 requests / 60 seconds per IP.\n\n' +
      '**Headers:** All responses include security headers via Helmet.',
    )
    .setVersion('1.0')
    .addTag('Restaurant Requests', 'Partner onboarding request collection')
    .addTag('Organizations')
    .addTag('Outlets')
    .addTag('Users')
    .addTag('Menu Items')
    .addTag('Orders')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // ─── Start ─────────────────────────────────────────────────────────────────
  await app.listen(port);
  logger.log(`Application running on: ${await app.getUrl()}`);
  logger.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV') ?? 'development'}`);
}
bootstrap();
