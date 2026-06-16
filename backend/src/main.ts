/**
 * Application bootstrap: cookie parser, CORS with credentials, global validation.
 * Default port 3000. See docs/SETUP_TESTE.md for local emulator workflow.
 */
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';

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
  setupSwagger(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Server is running on port ${port}`);
  Logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
