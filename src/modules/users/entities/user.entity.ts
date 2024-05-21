import { Collection, Embedded, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, } from '@mikro-orm/core';
import { IsBoolean, IsEmail, IsOptional, IsString, Length, Matches }                             from 'class-validator';
import { v4 }                                                                                    from 'uuid';

import { BCRYPT_HASH_OR_UNSET, NAME_REGEX, SLUG_REGEX, } from '@common/consts/regex.const';
import { CompanyEntity }                                 from '@modules/company/entities/company.entity';
import { CompanyUserEntity }                             from '@modules/company-user/entities/company-user.entity';

import { CredentialsEmbeddable } from '../embeddables/credentials.embeddable';
import { IUser }                 from '../interfaces/user.interface';
import { OAuthProviderEntity }   from './oauth-provider.entity';

@Entity({tableName: 'users'})
export class UserEntity implements IUser {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

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
  @IsString()
  @IsOptional()
  public avatar?: string;

  // User portrait picture
  @Property({columnType: 'varchar', length: 255, nullable: true})
  @IsString()
  @IsOptional()
  public portrait?: string;

  // User's location
  @Property({columnType: 'varchar', length: 255, nullable: true})
  @IsString()
  @IsOptional()
  public location: string;

  // JSON of user's settings
  @Property({columnType: 'json', nullable: true})
  public settings: Record<string, any>;

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date = new Date();

  @ManyToOne(() => CompanyEntity, {nullable: true})
  public activeCompany: CompanyEntity;

  @OneToMany(() => OAuthProviderEntity, (oauth) => oauth.user)
  public oauthProviders = new Collection<OAuthProviderEntity, UserEntity>(this);

  @OneToMany(() => CompanyEntity, (company) => company.owner)
  public ownedCompanies = new Collection<CompanyEntity>(this);

  @OneToMany(() => CompanyUserEntity, companyUser => companyUser.user)
  public companyUsers = new Collection<CompanyUserEntity>(this);

  @ManyToMany({entity: () => CompanyEntity, mappedBy: c => c.users})
  public assignedCompanies = new Collection<CompanyEntity>(this);
}
