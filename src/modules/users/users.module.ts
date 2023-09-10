import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '@/modules/users/entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserEntity])
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
