import { MockedObject } from 'ts-jest';
import { SessionStorage } from '../../src/core.interfaces';

export const mockSessionStorage: MockedObject<SessionStorage> = {
  getSessionById: jest.fn(),
};
