import { Injectable }                      from '@nestjs/common';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { BenefitViewEntity }               from '@modules/benefits/entities/benefit-view.entity';

@Injectable()
export class BenefitViewService {
  constructor(
    @InjectRepository(BenefitViewEntity) private readonly _benefitViewRepository: EntityRepository<BenefitViewEntity>,
    private readonly _em: EntityManager
  ) {}

  public create(benefitId: string): void {
    const view = this._benefitViewRepository.create({
      benefit: benefitId,
      timestamp: new Date().getTime(),
    });

    this._em.persistAndFlush(view).then();
  }
}
