import { SessionStorage } from '@nestjs-shopify/core';

export const mockSessionStorage = {
  loadSession: jest.fn(),
} as unknown as jest.Mocked<SessionStorage>;
