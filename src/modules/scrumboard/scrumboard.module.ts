import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CompanyUserModule } from '@modules/company-user/company-user.module';
import { JwtModule }         from '@modules/jwt/jwt.module';

import { BoardController } from './controllers/board.controller';
import { CardController }  from './controllers/card.controller';
import { ListController }  from './controllers/list.controller';
import { CardEntity }      from './entities/card.entity';
import { BoardEntity }     from './entities/board.entity';
import { LabelEntity }     from './entities/label.entity';
import { ListEntity }      from './entities/list.entity';
import { BoardGateway }    from './gateways/board.gateway';
import { BoardService }    from './services/board.service';
import { CardService }     from './services/card.service';
import { ListService }     from './services/list.service';
import { MemberService }   from './services/member.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ BoardEntity, ListEntity, CardEntity, LabelEntity ]),
    CompanyUserModule,
    JwtModule
  ],
  controllers: [
    BoardController,
    CardController,
    ListController
  ],
  providers: [
    BoardService,
    CardService,
    ListService,
    MemberService,
    BoardGateway
  ],
})
export class ScrumboardModule {}
