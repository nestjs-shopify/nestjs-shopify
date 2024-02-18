import { SessionStorage } from '@shopify/shopify-app-session-storage';

export const mockSessionStorage = {
  loadSession: jest.fn(),
} as unknown as jest.Mocked<SessionStorage>;
