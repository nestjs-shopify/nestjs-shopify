import { type ServerResponse, type IncomingMessage } from 'http';

type FastifyRequestLike = { raw: IncomingMessage };
type FastifyResponseLike = { raw: ServerResponse };

function isFastifyRequest(req: unknown): req is FastifyRequestLike {
  return typeof req === 'object' && req !== null && 'raw' in req;
}

function isFastifyResponse(res: unknown): res is FastifyResponseLike {
  return typeof res === 'object' && res !== null && 'raw' in res;
}

export class ShopifyCoreRequestWrapper {
  static getRawRequest(req: unknown): IncomingMessage {
    if (isFastifyRequest(req)) {
      return req.raw;
    }

    return req as IncomingMessage;
  }

  static getRawResponse(res: unknown): ServerResponse {
    if (isFastifyResponse(res)) {
      return res.raw;
    }

    return res as ServerResponse;
  }
}
