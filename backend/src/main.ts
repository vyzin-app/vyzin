/**
 * Application bootstrap: cookie parser, CORS with credentials, global validation.
 * Default port 3000. See docs/SETUP_TESTE.md for local emulator workflow.
 */
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
