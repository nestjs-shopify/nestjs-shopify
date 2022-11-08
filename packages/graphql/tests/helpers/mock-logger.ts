import { LogSeverity } from '@shopify/shopify-api';

export const mockLogger = {
  httpRequests: false,
  level: LogSeverity.Error,
  log: jest.fn(),
  timestamps: false,
};
