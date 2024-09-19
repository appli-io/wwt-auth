import { Injectable }                      from '@nestjs/common';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { BenefitCategoryViewEntity }       from '@modules/benefits/entities/benefit-category-view.entity';

@Injectable()
export class BenefitCategoryViewService {
  constructor(
    @InjectRepository(BenefitCategoryViewEntity) private readonly _benefitCategoryViewRepository: EntityRepository<BenefitCategoryViewEntity>,
    private readonly _em: EntityManager
  ) {}

  public create(benefitCategoryId: string): void {
    const view = this._benefitCategoryViewRepository.create({
      benefitCategory: benefitCategoryId,
      timestamp: new Date(),
    });

    this._em.persistAndFlush(view).then();
  }
}
