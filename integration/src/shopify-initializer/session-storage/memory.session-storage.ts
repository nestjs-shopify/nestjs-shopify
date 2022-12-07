import { Injectable } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import { SessionStorage } from '../../../../packages/core/src';

@Injectable()
export class MemorySessionStorage implements SessionStorage {
  private readonly sessions = new Map<string, Session>();

  async getSessionById(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
}
