import '@shopify/shopify-api/adapters/node';
import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { SHOPIFY_API_CONTEXT } from '../../src/core.constants';
import { ShopifyCspMiddleware } from '../../src/csp/csp.middleware';
import { MockShopifyCoreModule } from '../helpers/mock-shopify-core-module';
import { Shopify } from '@shopify/shopify-api';

@Controller()
export class DummyController {
  @Get()
  public index() {
    return 'Hello World!';
  }
}

@Module({
  controllers: [DummyController],
})
export class DummyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShopifyCspMiddleware).forRoutes('*');
  }
}

describe('ShopifyCspMiddleware', () => {
  let app: INestApplication;
  let shopifyApi: Shopify;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MockShopifyCoreModule, DummyModule],
    }).compile();

    app = await module.createNestApplication().init();

    shopifyApi = module.get<Shopify>(SHOPIFY_API_CONTEXT);
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  describe('when embedded app', () => {
    beforeEach(() => {
      shopifyApi.config.isEmbeddedApp = true;
    });

    it('should set CSP frame-ancestors when shop is provided', async () => {
      await request(app.getHttpServer())
        .get('/?shop=shop1.myshopify.com')
        .expect(
          'Content-Security-Policy',
          'frame-ancestors https://shop1.myshopify.com https://admin.shopify.com;'
        )
        .expect(200);
    });

    it('should set CSP frame-ancestors to none when shop is not provided', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect('Content-Security-Policy', 'frame-ancestors none')
        .expect(200);
    });
  });

  describe('when non-embedded app', () => {
    beforeEach(() => {
      shopifyApi.config.isEmbeddedApp = false;
    });

    it('should set CSP frame-ancestors to none', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect('Content-Security-Policy', 'frame-ancestors none')
        .expect(200);
    });
  });
});
