import { Module }         from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EventEntity }    from '@modules/events/entities/event.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([ EventEntity ])
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class EventsModule {

}
