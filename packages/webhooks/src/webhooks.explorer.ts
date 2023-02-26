import { InjectShopify } from '@nestjs-shopify/core';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ApplicationConfig,
  ContextIdFactory,
  DiscoveryService,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import {
  AddHandlersParams,
  DeliveryMethod,
  Shopify,
  WebhookHandler,
} from '@shopify/shopify-api';
import { addLeadingSlash } from './utils/add-leading-slash.util';
import { ShopifyWebhooksMetadataAccessor } from './webhooks-metadata.accessor';
import {
  SHOPIFY_WEBHOOKS_DEFAULT_PATH,
  SHOPIFY_WEBHOOKS_OPTIONS,
} from './webhooks.constants';
import { InvalidHandlerClassError } from './webhooks.errors';
import {
  ShopifyWebhookHandler,
  ShopifyWebhooksOptions,
} from './webhooks.interfaces';

@Injectable()
export class ShopifyWebhooksExplorer implements OnModuleInit {
  private readonly injector = new Injector();

  constructor(
    @InjectShopify()
    private readonly shopifyApi: Shopify,
    @Inject(SHOPIFY_WEBHOOKS_OPTIONS)
    private readonly options: ShopifyWebhooksOptions,
    private readonly appConfig: ApplicationConfig,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ShopifyWebhooksMetadataAccessor
  ) {}

  async onModuleInit() {
    await this.registerHandlers();
  }

  async registerHandlers() {
    const handlers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isShopifyWebhookHandler(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype
        )
      );

    const handlerParams: AddHandlersParams = {};

    handlers.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      const metadata = this.metadataAccessor.getShopifyWebhooksHandlerMetadata(
        instance.constructor || metatype
      );

      if (!metadata) {
        throw new Error(
          `No metadata found for Shopfiy Webhook Handler ${
            instance.constructor || metatype
          }`
        );
      }

      if (!(instance instanceof ShopifyWebhookHandler)) {
        throw new InvalidHandlerClassError(instance.constructor?.name);
      }

      const { topic } = metadata;
      const webhookHandler = this.buildWebhookHandler(
        instance,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        wrapper.host!,
        isRequestScoped
      );

      const globalPrefix = this.appConfig.getGlobalPrefix();
      const webhookPath = [
        globalPrefix,
        this.options.path || SHOPIFY_WEBHOOKS_DEFAULT_PATH,
      ]
        .join('/')
        .replace('//', '/');

      handlerParams[topic] ??= [];
      (handlerParams[topic] as WebhookHandler[]).push({
        deliveryMethod: DeliveryMethod.Http,
        callback: webhookHandler,
        callbackUrl: addLeadingSlash(webhookPath),
      });
    });

    await this.shopifyApi.webhooks.addHandlers(handlerParams);
  }

  private buildWebhookHandler(
    instance: ShopifyWebhookHandler,
    moduleRef: Module,
    isRequestScoped: boolean
  ) {
    const methodKey = 'handle';
    let handle;

    if (isRequestScoped) {
      handle = async (
        _topic: string,
        shop: string,
        body: string,
        webhookId: string
      ) => {
        const contextId = ContextIdFactory.create();

        const contextInstance = await this.injector.loadPerContext(
          instance,
          moduleRef,
          moduleRef.providers,
          contextId
        );
        const data = JSON.parse(body);
        return contextInstance[methodKey].call(
          contextInstance,
          shop,
          data,
          webhookId
        );
      };
    } else {
      handle = (
        _topic: string,
        shop: string,
        body: string,
        webhookId: string
      ) => {
        const data = JSON.parse(body);
        return instance[methodKey].call(instance, shop, data, webhookId);
      };
    }

    return handle;
  }
}
