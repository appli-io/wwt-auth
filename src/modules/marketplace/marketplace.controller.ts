import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser }        from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }        from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }   from '@modules/company/decorators/company-id.decorator';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { MarketplaceService } from '@modules/marketplace/marketplace.service';
import { CreateCategoryDto }  from '@modules/marketplace/dtos/create-category.dto';
import { CreateProductDto }   from '@modules/marketplace/dtos/create-product.dto';

@Controller('marketplace')
@UseGuards(MemberGuard)
export class MarketplaceController {
  constructor(
    private readonly _marketplaceService: MarketplaceService,
    private readonly _companyUserService: CompanyUserService
  ) {}

  @Get('categories')
  public async getCategories(
    @CurrentCompanyId() companyId: string
  ) {
    return this._marketplaceService.getCategories(companyId);
  }

  @Post('categories')
  public async postCategory(
    @CurrentCompanyId() companyId: string,
    @Body() dto: CreateCategoryDto
  ) {
    return this._marketplaceService.postCategory(dto, companyId);
  }

  @Get('categories/products')
  public async getCategoriesWithProducts(
    @CurrentCompanyId() companyId: string
  ) {
    return this._marketplaceService.getCategoriesWithProducts(companyId);
  }

  @Get('products')
  public async getProducts(
    @CurrentCompanyId() companyId: string
  ) {
    return this._marketplaceService.getProducts(companyId);
  }

  @Get('products/:productId')
  public async getProduct(
    @CurrentCompanyId() companyId: string,
    @Param('productId') productId: string
  ) {
    return this._marketplaceService.getProduct(productId, companyId);
  }

  @Post('products')
  public async postProduct(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateProductDto
  ) {
    const seller = await this._companyUserService.findOne(userId, companyId);

    if (!seller) throw new ForbiddenException('SELLER_NOT_FOUND');

    return this._marketplaceService.postProduct(dto, seller, companyId);
  }
}
