<p align="center">
  <img src="https://user-images.githubusercontent.com/1763486/209360850-305e128b-08e4-4844-8fa8-620faaf81f5a.png" />
</p>

<p align="center">
  A monorepo containing packages to develop Shopify application using NestJS.<br />
</p>
<br />

## Upgrade to `@nestjs-shopify/express` or `@nestjs-shopify/fastify`

See upgrade guide [here](docs/migrate-to-express-or-fastify-package.md).

## Packages

| Package                                       | Description                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [@nestjs-shopify/express](packages/express)   | Initialize the `@shopify/shopify-api` package with your Express NestJS app.                       |
| [@nestjs-shopify/fastify](packages/fastify)   | Initialize the `@shopify/shopify-api` package with your Fastify NestJS app.                       |
| [@nestjs-shopify/common](packages/common)     | Common utilities (like HMAC validation, applying CSP headers, etc.)                               |
| [@nestjs-shopify/webhooks](packages/webhooks) | Register and process Shopify webhooks.                                                            |
| [@nestjs-shopify/auth](packages/auth)         | Setup online and/or offline auth and protected your NestJS API with Shopify JWT session tokens.   |
| [@nestjs-shopify/graphql](packages/graphql)   | Setup a Shopify GraphQL Admin API proxy that is automatically setup to use online session tokens. |
| [@nestjs-shopify/core](packages/core)         | Private module to be used by `@nestjs-shopify/express` or `@nestjs-shopify/fastify`               |

## Example app

See https://github.com/nestjs-shopify/example-nx-app for an example app with a NextJS frontend.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
