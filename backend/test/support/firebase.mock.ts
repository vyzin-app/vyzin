import { FirebaseService } from '../../src/firebase/firebase.service';
import { AuthSessionService } from '../../src/auth/services/auth-session.service';

let createdUserCounter = 0;

export const firebaseAuthMock = {
  createUser: jest.fn().mockImplementation(async () => {
    createdUserCounter += 1;
    return { uid: `uid-created-${createdUserCounter}` };
  }),
  setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  getUserByEmail: jest.fn().mockRejectedValue(
    Object.assign(new Error('User not found'), { code: 'auth/user-not-found' }),
  ),
  verifyIdToken: jest.fn(),
  verifySessionCookie: jest.fn(),
  createSessionCookie: jest.fn().mockResolvedValue('mock-session-cookie'),
  revokeRefreshTokens: jest.fn().mockResolvedValue(undefined),
};

export const firebaseServiceMock: Pick<
  FirebaseService,
  'onModuleInit' | 'getAuth' | 'getFirestore'
> = {
  onModuleInit: jest.fn(),
  getAuth: () => firebaseAuthMock as never,
  getFirestore: jest.fn(),
};

export const authSessionServiceMock: Pick<
  AuthSessionService,
  'login' | 'logout'
> = {
  login: jest.fn().mockImplementation(async (email: string) => {
    let uid = 'uid-resident';
    if (email.includes('admin')) {
      uid = 'uid-admin';
    } else if (email.includes('porteiro')) {
      uid = 'uid-doorman';
    }
    return {
      sessionCookie: `mock-session-${uid}`,
      expiresIn: 86400000,
      uid,
    };
  }),
  logout: jest.fn().mockResolvedValue(undefined),
};

export function resetFirebaseMocks() {
  createdUserCounter = 0;
  jest.clearAllMocks();
  firebaseAuthMock.createUser.mockImplementation(async () => {
    createdUserCounter += 1;
    return { uid: `uid-created-${createdUserCounter}` };
  });
}
