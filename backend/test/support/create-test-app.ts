import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { AuthSessionService } from '../../src/auth/services/auth-session.service';
import { FirebaseService } from '../../src/firebase/firebase.service';
import { RepositoryFactory } from '../../src/persistence/firestore/repository.factory';
import {
  authSessionServiceMock,
  firebaseServiceMock,
  resetFirebaseMocks,
} from './firebase.mock';
import { MemoryRepositoryFactory } from './memory-repository.factory';
import { seedTestData } from './seed-test-data';

export async function createTestApp(): Promise<INestApplication> {
  resetFirebaseMocks();
  await seedTestData();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(RepositoryFactory)
    .useClass(MemoryRepositoryFactory)
    .overrideProvider(FirebaseService)
    .useValue(firebaseServiceMock)
    .overrideProvider(AuthSessionService)
    .useValue(authSessionServiceMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.init();
  return app;
}
