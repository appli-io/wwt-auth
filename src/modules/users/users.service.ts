import { BadRequestException, ConflictException, Injectable, UnauthorizedException, } from '@nestjs/common';

import { QueryOrder }       from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { compare, hash } from 'bcrypt';
import { isUUID }        from 'class-validator';

import { CommonService }       from '@common/common.service';
import { SLUG_REGEX }          from '@common/consts/regex.const';
import { isNull, isUndefined } from '@common/utils/validation.util';
import { UsersContactEntity }  from '@modules/company-user/entities/users-contact.entity';
import { CompanyUserService }  from '@modules/company-user/company-user.service';
import { UpdateUserInfoDto }   from '@modules/users/dtos/update-user-info.dto';
import { ContactDto }          from '@modules/users/dtos/contact.dto';

import { ChangeEmailDto }        from './dtos/change-email.dto';
import { PasswordDto }           from './dtos/password.dto';
import { CredentialsEmbeddable } from './embeddables/credentials.embeddable';
import { OAuthProviderEntity }   from './entities/oauth-provider.entity';
import { UserEntity }            from './entities/user.entity';
import { OAuthProvidersEnum }    from './enums/oauth-providers.enum';
import { StorageService }        from '@modules/firebase/services/storage.service';
import { IUser }                 from './interfaces/user.interface';
import { CompanyEntity }         from '@modules/company/entities/company.entity';
import { FileType }              from '@modules/firebase/enums/file-type.enum';
import sharp                     from 'sharp';
import { FileEntity }            from '@modules/firebase/entities/file.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly _usersRepository: EntityRepository<UserEntity>,
    @InjectRepository(UsersContactEntity) private readonly _usersContactRepository: EntityRepository<UsersContactEntity>,
    @InjectRepository(OAuthProviderEntity) private readonly _oauthProvidersRepository: EntityRepository<OAuthProviderEntity>,
    private readonly _companyUserService: CompanyUserService,
    private readonly _storageService: StorageService,
    private readonly commonService: CommonService,
  ) {
  }

  public async create(provider: OAuthProvidersEnum, email: string, firstname: string, lastname: string, password?: string, confirmed: boolean = false): Promise<UserEntity> {
    const isConfirmed = provider !== OAuthProvidersEnum.LOCAL || confirmed;
    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    const formattedFirstname = this.commonService.formatName(firstname);
    const formattedLastname = this.commonService.formatName(lastname);
    const user = this._usersRepository.create({
      email: formattedEmail,
      firstname: formattedFirstname,
      lastname: formattedLastname,
      username: await this.generateUsername(formattedFirstname + ' ' + formattedLastname),
      password: isUndefined(password) ? 'UNSET' : await hash(password, 10),
      confirmed: isConfirmed,
      credentials: new CredentialsEmbeddable(isConfirmed),
    });
    await this.commonService.saveEntity(user, true);
    await this.createOAuthProvider(provider, user.id);
    return user;
  }

  public async findAll(): Promise<UserEntity[]> {
    return this._usersRepository.findAll({populate: [ 'avatar' ]});
  }

  public async findOneByIdOrUsername(idOrUsername: string,): Promise<UserEntity> {
    if (isUUID(idOrUsername)) {
      return this.findOneById(idOrUsername, [ 'companyUsers.contacts' ]);
    }

    if (
      idOrUsername.length < 3 ||
      idOrUsername.length > 106 ||
      !SLUG_REGEX.test(idOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.findOneByUsername(idOrUsername);
  }

  public async findOneById(id: string, populateJoin: any[] = []): Promise<UserEntity> {
    const user = await this._usersRepository.findOne({id}, {populate: [ ...populateJoin, 'avatar' ], refresh: true});
    this.commonService.checkEntityExistence(user, 'User');

    return user;
  }

  public async findOneByUsername(username: string, forAuth = false,): Promise<UserEntity> {
    const user = await this._usersRepository.findOne({username: username.toLowerCase()}, {populate: [ 'assignedCompanies', 'activeCompany', 'companyUsers', 'avatar' ]});

    if (forAuth)
      this.throwUnauthorizedException(user);
    else
      this.commonService.checkEntityExistence(user, 'User');

    return user;
  }

  public async findOneByEmail(email: string, populate: any[] = []): Promise<UserEntity> {
    return await this._usersRepository.findOne({
      email: email.toLowerCase(),
    }, {populate: [ ...populate, 'avatar' ]});
  }

  // necessary for password reset
  public async uncheckedUserByEmail(email: string): Promise<UserEntity> {
    return this._usersRepository.findOne({
      email: email.toLowerCase(),
    });
  }

  public async findOneByCredentials(id: string, version: number,): Promise<UserEntity> {
    const user = await this._usersRepository.findOne({id}, {populate: [ 'assignedCompanies', 'companyUsers', 'activeCompany', 'avatar' ]});
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version)
      throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  public async confirmEmail(userId: string, version: number,): Promise<UserEntity> {
    const user = await this.findOneByCredentials(userId, version);

    if (user.confirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    user.confirmed = true;
    user.credentials.updateVersion();
    await this.commonService.saveEntity(user);

    return user;
  }

  public async updateUserInfo(userId: string, dto: UpdateUserInfoDto): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    Object.assign(user, dto);

    await this.commonService.saveEntity(user);

    return this.findOneById(userId, [ 'companyUsers.company', 'companyUsers.contacts' ]);
  }

  public async updatePassword(userId: string, newPassword: string, password?: string,): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    if (user.password === 'UNSET') {
      await this.createOAuthProvider(OAuthProvidersEnum.LOCAL, user.id);
    } else {
      if (isUndefined(password) || isNull(password)) {
        throw new BadRequestException('Password is required');
      }
      if (!(await compare(password, user.password))) {
        throw new BadRequestException('Wrong password');
      }
      if (await compare(newPassword, user.password)) {
        throw new BadRequestException('New password must be different');
      }
    }

    return await this.changePassword(user, newPassword);
  }

  public async resetPassword(userId: string, version: number, password: string,): Promise<UserEntity> {
    const user = await this.findOneByCredentials(userId, version);
    return await this.changePassword(user, password);
  }

  public async updateEmail(userId: string, dto: ChangeEmailDto,): Promise<UserEntity> {
    const user = await this.findOneById(userId);
    const {email, password} = dto;

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    const formattedEmail = email.toLowerCase();

    if (user.email === formattedEmail) {
      throw new BadRequestException('Email should be different');
    }

    await this.checkEmailUniqueness(formattedEmail);
    user.email = formattedEmail;
    await this.commonService.saveEntity(user);
    return user;
  }

  public async delete(userId: string, dto: PasswordDto): Promise<UserEntity> {
    const user = await this.findOneById(userId);

    if (!(await compare(dto.password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    await this.commonService.removeEntity(user);
    return user;
  }

  public async findOrCreate(provider: OAuthProvidersEnum, email: string, name: string,): Promise<UserEntity> {
    const formattedEmail = email.toLowerCase();
    const user = await this._usersRepository.findOne(
      {
        email: formattedEmail,
      },
      {
        populate: [ 'oauthProviders' ],
      },
    );

    if (isUndefined(user) || isNull(user)) {
      return this.create(provider, email, name, undefined);
    }
    if (
      isUndefined(
        user.oauthProviders.getItems().find((p) => p.provider === provider),
      )
    ) {
      await this.createOAuthProvider(provider, user.id);
    }

    return user;
  }

  public async findOAuthProviders(userId: string,): Promise<OAuthProviderEntity[]> {
    return await this._oauthProvidersRepository.find(
      {
        user: userId,
      },
      {orderBy: {provider: QueryOrder.ASC}},
    );
  }

  public async updateAvatar(id: string, file: Express.Multer.File): Promise<IUser> {
    const user = await this.findOneById(id);
    const path = `users/${ id }/avatar`;

    const fileBuffer = await sharp(file.buffer).resize(500).rotate().webp().toBuffer();

    if (user.avatar instanceof FileEntity) {
      await this._storageService.removeFile(user.avatar);
    }
    user.avatar = await this._storageService.upload(undefined, FileType.IMAGE, path, {
      ...file,
      buffer: fileBuffer,
      size: fileBuffer.length,
      originalname: 'avatar.webp',
      mimetype: 'image/webp',
    });
    await this.commonService.saveEntity(user);

    return user;
  }

  public async setActiveCompany(userId: string, companyId: string) {
    const user = await this.findOneById(userId);
    user.activeCompany = {id: companyId} as CompanyEntity;

    await this.commonService.saveEntity(user);
  }

  public async updateContacts(userId: string, contacts: ContactDto[]) {
    const user = await this.findOneById(userId, [ 'companyUsers.contacts' ]);

    await this.validateAndUpdateContactInfo(user, contacts);
    return user;
  }


  private async changePassword(user: UserEntity, password: string,): Promise<UserEntity> {
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, 10);
    await this.commonService.saveEntity(user);
    return user;
  }

  private async checkUsernameUniqueness(username: string): Promise<void> {
    const count = await this._usersRepository.count({username});

    if (count > 0) {
      throw new ConflictException('Username already in use');
    }
  }

  private throwUnauthorizedException(user: undefined | null | UserEntity): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async checkEmailUniqueness(email: string): Promise<void> {
    const count = await this._usersRepository.count({email});

    if (count > 0) {
      throw new ConflictException('Email already in use');
    }
  }

  /**
   * Generate Username
   *
   * Generates a unique username using a point slug based on the name
   * and if it's already in use, it adds the usernames count to the end
   */
  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this._usersRepository.count({
      username: {
        $like: `${ pointSlug }%`,
      },
    });

    if (count > 0) {
      return `${ pointSlug }${ count }`;
    }

    return pointSlug;
  }

  private async createOAuthProvider(provider: OAuthProvidersEnum, userId: string,): Promise<OAuthProviderEntity> {
    const oauthProvider = this._oauthProvidersRepository.create({
      provider,
      user: userId,
    });
    await this.commonService.saveEntity(oauthProvider, true,);
    return oauthProvider;
  }

  private async validateAndUpdateContactInfo(user: UserEntity, contactsDto: ContactDto[]) {
    const uniqueCompaniesIds = new Set(contactsDto.map(dto => dto.companyId));

    if (!await this._companyUserService.isActiveUserInCompanies(user.id, Array.from(uniqueCompaniesIds)))
      throw new UnauthorizedException('You not belong to one of the companies you are trying to add contacts to or you are not active in one of them');

    const existingContacts = await this._usersContactRepository.createQueryBuilder('uc')
      .leftJoinAndSelect('uc.companyUser', 'cu')
      .leftJoinAndSelect('cu.user', 'u')
      .leftJoinAndSelect('cu.company', 'c')
      .where({'u.id': user.id})
      .populate([ {field: 'companyUser', all: true} ])
      .getResultList();

    const contactsToAdd: ContactDto[] = [];
    const updatedContacts: UsersContactEntity[] = [];
    const contactsToRemove = existingContacts.filter(contact =>
      !contactsDto.find(dto =>
        dto.value === contact.value &&
        dto.type === contact.type &&
        dto.companyId === contact.companyUser.company.id
      )
    );

    for (const dto of contactsDto) {
      if (dto.id) {
        const contact = existingContacts.find(c => c.id === dto.id);

        Object.assign(contact, dto);
        updatedContacts.push(contact);
      } else {
        contactsToAdd.push(dto);
      }
    }

    await this.addContacts(contactsToAdd, user);
    await this.removeContacts(contactsToRemove);

    await this.commonService.saveAllEntities(updatedContacts, true);
  }

  private isDuplicate(newContactDto: ContactDto, contactsToAdd: ContactDto[]): boolean {
    return contactsToAdd.some(contact => contact.value === newContactDto.value && contact.type === newContactDto.type && contact.companyId === newContactDto.companyId);
  }

  private async addContacts(contactsToAdd: ContactDto[], user: UserEntity) {
    const contacts = contactsToAdd.map(dto => {
      return this._usersContactRepository.create({
        ...dto,
        companyUser: this._companyUserService._em.getReference('CompanyUserEntity', {user: user.id, company: dto.companyId}),
      });
    });

    await this.commonService.saveAllEntities(contacts, true);
  }

  private async removeContacts(contactsToRemove: UsersContactEntity[]) {
    // TODO: Logic to remove unused contacts from the database
  }
}
