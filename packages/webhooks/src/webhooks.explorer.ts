import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ContextIdFactory, DiscoveryService } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import Shopify from '@shopify/shopify-api';
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
    @Inject(SHOPIFY_WEBHOOKS_OPTIONS)
    private readonly options: ShopifyWebhooksOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ShopifyWebhooksMetadataAccessor
  ) {}

  onModuleInit() {
    this.registerHandlers();
  }

  registerHandlers() {
    const handlers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isShopifyWebhookHandler(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype
        )
      );

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

      Shopify.Webhooks.Registry.addHandler(topic, {
        path: this.options.path || SHOPIFY_WEBHOOKS_DEFAULT_PATH,
        webhookHandler,
      });
    });
  }

  private buildWebhookHandler(
    instance: ShopifyWebhookHandler,
    moduleRef: Module,
    isRequestScoped: boolean
  ) {
    const methodKey = 'handle';
    let handle;

    if (isRequestScoped) {
      handle = async (_topic: string, shop: string, body: string) => {
        const contextId = ContextIdFactory.create();

        const contextInstance = await this.injector.loadPerContext(
          instance,
          moduleRef,
          moduleRef.providers,
          contextId
        );
        const data = JSON.parse(body);
        return contextInstance[methodKey].call(contextInstance, shop, data);
      };
    } else {
      handle = (_topic: string, shop: string, body: string) => {
        const data = JSON.parse(body);
        return instance[methodKey].call(instance, shop, data);
      };
    }

    return handle;
  }
}
