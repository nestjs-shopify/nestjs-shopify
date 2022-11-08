import { SessionStorage } from '@nestjs-shopify/core';
import { MockedObject } from 'ts-jest';

export const mockSessionStorage: MockedObject<SessionStorage> = {
  getSessionById: jest.fn().mockResolvedValue(undefined),
};
