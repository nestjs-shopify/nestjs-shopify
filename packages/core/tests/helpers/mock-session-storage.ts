import { SessionStorage } from '../../src/core.interfaces';

export const mockSessionStorage = {
  loadSession: jest.fn(),
} as unknown as jest.Mocked<SessionStorage>;
