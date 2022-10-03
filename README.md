# @nestjs-shopify

A monorepo containing packages to develop Shopify application using NestJS.

## Packages

| Package                                       | Description                                                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [@nestjs-shopify/core](packages/core)         | Use to initialize the `@shopify/shopify-api` package with your Shopify app credentials. Required for webhooks and auth. |
| [@nestjs-shopify/webhooks](packages/webhooks) | Register and process Shopify webhooks.                                                                                  |
| [@nestjs-shopify/auth](packages/auth)         | Setup online and/or offline auth and protected your NestJS API with Shopify JWT session tokens.                         |
| [@nestjs-shopify/graphql](packages/graphql)   | Setup a Shopify GraphQL Admin API proxy that is automatically setup to use online session tokens.                       |

## Example app

See https://github.com/nestjs-shopify/example-nx-app for an example app with a NextJS frontend.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
