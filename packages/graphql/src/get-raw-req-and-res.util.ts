import { HttpAdapterHost } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';

export const getAdapter = (adapterHost: HttpAdapterHost): string => {
  return adapterHost.httpAdapter.getType() || 'express';
};

export const getRawReqAndRes = (
  adapterHost: HttpAdapterHost,
  req: any,
  res: any
): { rawRequest: IncomingMessage; rawResponse: ServerResponse } => {
  const adapter = getAdapter(adapterHost);
  if (adapter === 'fastify') {
    return {
      rawRequest: req.raw,
      rawResponse: res.raw,
    };
  }
  return {
    rawRequest: req,
    rawResponse: res,
  };
};
