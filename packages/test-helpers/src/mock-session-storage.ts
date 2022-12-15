import { SessionStorage } from '@nestjs-shopify/core';
import { MockedObject } from 'ts-jest';

export const mockSessionStorage = {
  loadSession: jest.fn(),
} as unknown as MockedObject<SessionStorage>;
