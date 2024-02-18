import {
  ArgumentsHost,
  ExecutionContext,
  RawBodyRequest,
} from '@nestjs/common';
import { BeginParams, Session, Shopify } from '@shopify/shopify-api';
import { IncomingMessage, ServerResponse } from 'http';

type OAuthParams = Omit<BeginParams, 'rawRequest' | 'rawResponse'>;

export abstract class ShopifyHttpAdapter<
  RequestType = unknown,
  ResponseType = unknown,
> {
  constructor(protected readonly shopifyApi: Shopify) {}

  public async beginAuth(
    req: RequestType,
    res: ResponseType,
    params: OAuthParams,
  ) {
    return this.shopifyApi.auth.begin({
      ...params,
      rawRequest: this.getRawRequest(req),
      rawResponse: this.getRawResponse(res),
    });
  }

  public async beginCallback(req: RequestType, res: ResponseType) {
    return this.shopifyApi.auth.callback({
      rawRequest: this.getRawRequest(req),
      rawResponse: this.getRawResponse(res),
    });
  }

  public async getCurrentId(context: ExecutionContext, isOnline: boolean) {
    const request = this.getRequest(context);
    const response = this.getResponse(context);
    return this.shopifyApi.session.getCurrentId({
      rawRequest: this.getRawRequest(request),
      rawResponse: this.getRawResponse(response),
      isOnline,
    });
  }

  public async graphqlProxy(
    req: RequestType,
    res: ResponseType,
    session: Session,
  ) {
    const { body, headers } = await this.shopifyApi.clients.graphqlProxy({
      rawBody: this.getBody(req),
      session,
    });

    delete headers['Content-Encoding'];
    this.setHeaders(res, headers);

    return body;
  }

  public getHeader(req: RequestType, headerName: string) {
    const headers = this.extractHeaders(req);
    return headers[headerName];
  }

  public getHeaderFromExecutionContext(
    context: ExecutionContext,
    headerName: string,
  ) {
    const headers = this.getHeadersFromExecutionContext(context);
    return headers[headerName];
  }

  public getHeaders(req: RequestType) {
    return this.extractHeaders(req);
  }

  public getHeadersFromExecutionContext(context: ExecutionContext) {
    const request = this.getRequest(context);
    return this.extractHeaders(request);
  }

  public setHeaders(
    res: ResponseType,
    headers: Record<string, string | string[]>,
  ) {
    Object.entries(headers).forEach(([header, value]) => {
      this.setHeader(res, header, value);
    });
  }

  public getQueryParamFromExecutionContext(
    context: ExecutionContext,
    queryName: string,
  ) {
    return this.getQueryParamsFromExecutionContext(context)[queryName];
  }

  public getQueryParam(req: RequestType, queryName: string) {
    return this.extractQueryParams(req)[queryName];
  }

  public getQueryParamsFromExecutionContext<
    Query = Record<string, string | string[] | undefined>,
  >(context: ExecutionContext): Query {
    const request = this.getRequest(context);
    return this.extractQueryParams(request);
  }

  public getQueryParams<Query = Record<string, string | string[] | undefined>>(
    req: RequestType,
  ): Query {
    return this.extractQueryParams(req);
  }

  public getRawBodyFromExecutionContext(
    context: ExecutionContext,
  ): Buffer | undefined {
    const request = this.getRequest(context) as RawBodyRequest<RequestType>;
    return request.rawBody;
  }

  public getRawBody(req: RequestType): Buffer | undefined {
    return (req as RawBodyRequest<RequestType>).rawBody;
  }

  protected abstract setHeader(
    response: ResponseType,
    header: string,
    value: string | string[],
  ): void;

  protected abstract extractHeaders(
    request: RequestType,
  ): Record<string, string | string[] | undefined>;

  protected abstract extractQueryParams<Query = Record<string, unknown>>(
    req: RequestType,
  ): Query;

  public getRawRequest(req: RequestType): IncomingMessage {
    return req as IncomingMessage;
  }

  public getRawResponse(res: ResponseType): ServerResponse {
    return res as ServerResponse;
  }

  private getRequest(context: ExecutionContext | ArgumentsHost): RequestType {
    return context.switchToHttp().getRequest<RequestType>();
  }

  private getResponse(context: ExecutionContext | ArgumentsHost): ResponseType {
    return context.switchToHttp().getResponse<ResponseType>();
  }

  private getBody(req: RequestType) {
    return (req as { body: string }).body;
  }
}
