import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  const mockAuth = {
    createSessionCookie: jest.fn().mockResolvedValue('session-cookie'),
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'uid-1' }),
    verifySessionCookie: jest.fn().mockResolvedValue({ sub: 'uid-1' }),
    revokeRefreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.FIREBASE_WEB_API_KEY = 'test-api-key';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ idToken: 'id-token', localId: 'uid-1' }),
    }) as unknown as typeof fetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSessionService,
        {
          provide: FirebaseService,
          useValue: { getAuth: () => mockAuth },
        },
      ],
    }).compile();

    service = module.get(AuthSessionService);
  });

  it('creates session cookie after successful sign-in', async () => {
    const result = await service.login('user@test.com', 'secret123');

    expect(result.sessionCookie).toBe('session-cookie');
    expect(result.uid).toBe('uid-1');
    expect(mockAuth.createSessionCookie).toHaveBeenCalledWith('id-token', {
      expiresIn: expect.any(Number),
    });
  });

  it('rejects invalid credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'INVALID_LOGIN_CREDENTIALS' },
      }),
    });

    await expect(
      service.login('user@test.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
