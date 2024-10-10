import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CategoryEntity }        from './entities/category.entity';
import { ProductEntity }         from './entities/product.entity';
import { ProductImageEntity }    from './entities/product-image.entity';
import { ProposalEntity }        from './entities/proposal.entity';
import { SaleEntity }            from './entities/sale.entity';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService }    from './marketplace.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CategoryEntity,
      ProductEntity,
      ProductImageEntity,
      ProposalEntity,
      SaleEntity
    ])
  ],
  controllers: [ MarketplaceController ],
  providers: [ MarketplaceService ],
  exports: [],
})
export class MarketplaceModule {}
