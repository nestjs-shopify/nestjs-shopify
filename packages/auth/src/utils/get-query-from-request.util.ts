import { IncomingMessage } from 'node:http';

export function getQueryFromRequest(req: IncomingMessage): {
  [k: string]: string;
} {
  return Object.fromEntries(
    new URLSearchParams(req.url?.split('?')?.[1] || '').entries()
  );
}
