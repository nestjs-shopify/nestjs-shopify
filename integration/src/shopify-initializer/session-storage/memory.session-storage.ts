import { SessionStorage } from '@rh-nestjs-shopify/core';
import { Injectable } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';

@Injectable()
export class MemorySessionStorage implements SessionStorage {
  private readonly sessions = new Map<string, Session>();

  async storeSession(session: Session): Promise<boolean> {
    this.sessions.set(session.id, session);
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async deleteSession(id: string): Promise<boolean> {
    this.sessions.delete(id);
    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    for (const id in ids) {
      await this.deleteSession(id);
    }
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = [];
    for (const session of this.sessions.values()) {
      if (session.shop === shop) {
        sessions.push(session);
      }
    }

    return sessions;
  }
}
