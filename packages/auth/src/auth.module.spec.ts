import { Test, TestingModule } from '@nestjs/testing';
import { SHOPIFY_ACCESS_MODE } from './auth.constants';
import { AccessMode } from './auth.interfaces';
import { ShopifyAuthModule } from './auth.module';

describe('ShopifyAuthModule', () => {
  let module: TestingModule;

  describe('.forRoot', () => {
    describe('with online access mode', () => {
      beforeEach(async () => {
        module = await Test.createTestingModule({
          imports: [
            ShopifyAuthModule.forRoot(AccessMode.Online, {
              basePath: 'testing',
            }),
          ],
        }).compile();
      });

      it('should provide access mode', () => {
        const accessMode = module.get<AccessMode>(SHOPIFY_ACCESS_MODE);
        expect(accessMode).toEqual(AccessMode.Online);
      });
    });
  });
});
