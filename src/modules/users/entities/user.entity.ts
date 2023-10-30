import { Collection, Embedded, Entity, OneToMany, PrimaryKey, Property, } from '@mikro-orm/core';
import { IsBoolean, IsEmail, IsString, Length, Matches }                  from 'class-validator';
import { BCRYPT_HASH_OR_UNSET, NAME_REGEX, SLUG_REGEX, }                  from '@common/consts/regex.const';
import { CredentialsEmbeddable }                                          from '../embeddables/credentials.embeddable';
import { IUser }                                                          from '../interfaces/user.interface';
import { OAuthProviderEntity }                                            from './oauth-provider.entity';

@Entity({tableName: 'users'})
export class UserEntity implements IUser {
  @PrimaryKey()
  public id: number;

  @Property({columnType: 'varchar', length: 100})
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  public name: string;

  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  public username: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;

  @Property({columnType: 'varchar', length: 60})
  @IsString()
  @Length(5, 60)
  @Matches(BCRYPT_HASH_OR_UNSET)
  public password: string;

  @Property({columnType: 'boolean', default: false})
  @IsBoolean()
  public confirmed: true | false = false;

  @Embedded(() => CredentialsEmbeddable)
  public credentials: CredentialsEmbeddable = new CredentialsEmbeddable();

  // User profile picture
  @Property({columnType: 'varchar', length: 255, nullable: true})
  public avatar: string;

  // User's position
  @Property({columnType: 'varchar', length: 255, nullable: true})
  public position: string;

  // User's location
  @Property({columnType: 'varchar', length: 255, nullable: true})
  public location: string;

  // JSON of user's settings
  @Property({columnType: 'json', nullable: true})
  public settings: Record<string, any>;

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date = new Date();

  @OneToMany(() => OAuthProviderEntity, (oauth) => oauth.user)
  public oauthProviders = new Collection<OAuthProviderEntity, UserEntity>(this);
}
