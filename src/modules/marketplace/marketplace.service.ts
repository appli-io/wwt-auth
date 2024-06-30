import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository }                from '@mikro-orm/nestjs';

import { CompanyUserEntity }  from '@modules/company-user/entities/company-user.entity';
import { CreateCategoryDto }  from './dtos/create-category.dto';
import { CreateProductDto }   from './dtos/create-product.dto';
import { CategoryEntity }     from './entities/category.entity';
import { ProductEntity }      from './entities/product.entity';
import { ProductImageEntity } from './entities/product-image.entity';
import { ProposalEntity }     from './entities/proposal.entity';
import { SaleEntity }         from './entities/sale.entity';

@Injectable()
export class MarketplaceService {

  constructor(
    @InjectRepository(CategoryEntity) private readonly _categoryRepository: EntityRepository<CategoryEntity>,
    @InjectRepository(ProductEntity) private readonly _productRepository: EntityRepository<ProductEntity>,
    @InjectRepository(ProductImageEntity) private readonly _productImageRepository: EntityRepository<ProductImageEntity>,
    @InjectRepository(ProposalEntity) private readonly _proposalRepository: EntityRepository<ProposalEntity>,
    @InjectRepository(SaleEntity) private readonly _saleRepository: EntityRepository<SaleEntity>,
    private readonly _em: EntityManager
  ) {}

  public async getCategories(companyId: string) {
    return this._categoryRepository
      .findAll({
        where: [
          {company: {id: companyId}, $not: {children: {$eq: null}}},
          {company: {id: companyId}, parent: {$eq: null}}
        ],
        populate: [ 'children' ]
      });
  }

  public async getCategoriesWithProducts(companyId: string) {
    return this._categoryRepository
      .findAll({
        where: {company: {id: companyId}},
        populate: [ 'children', 'products' ]
      });
  }

  public async getCategory(categoryId: string, companyId: string) {
    const category = await this._categoryRepository.findOneOrFail({id: categoryId, company: {id: companyId}});

    if (!category) throw new BadRequestException('CATEGORY_NOT_FOUND');

    return category;
  }

  public async postCategory(dto: CreateCategoryDto, companyId: string) {
    if (dto.parent) {
      const parent = await this._categoryRepository.findOneOrFail({id: dto.parent, company: {id: companyId}});

      if (!parent) throw new BadRequestException('PARENT_NOT_FOUND');
      if (parent.parent) throw new BadRequestException('PARENT_CANNOT_HAVE_PARENT');
    }

    const category = this._categoryRepository.create({
      ...dto,
      company: companyId
    });

    await this._em.persistAndFlush(category);

    return category;
  }

  public async getProducts(companyId: string) {
    return this._productRepository.findAll({
      where: {company: {id: companyId}},
      populate: [ 'images' ]
    });
  }

  public async getProduct(productId: string, companyId: string) {
    return this._productRepository.findOneOrFail({id: productId, company: {id: companyId}});
  }

  public async postProduct(dto: CreateProductDto, userId: CompanyUserEntity, companyId: string) {
    const category = await this.getCategory(dto.category, companyId);

    const product = this._productRepository.create({
      ...dto,
      category,
      seller: userId,
      company: companyId,
    });

    await this._em.persistAndFlush(product);

    return product;
  }
}
