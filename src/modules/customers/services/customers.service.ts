/* eslint-disable security/detect-object-injection */
import { randomUUID } from 'crypto';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { hash } from 'bcrypt';
import { Logger } from 'nestjs-pino';

import { PartnerInfo } from 'src/authentication/guards/partner-api-key.guard';
import { CreateBankUserDto } from 'src/bank-users/dto/create-bank-user.dto';
import { BankUser } from 'src/bank-users/entities/bank-user.entity';
import { BankUsersGroupsService } from 'src/bank-users-groups/bank-users-groups.service';
import { PrismaTransaction } from 'src/common/types/prisma-transaction';
import { HttpErrorResponse } from 'src/http-client/http-client.service';
import { MaestroService } from 'src/modules/assemble/services/assemble.service';
import { WatchmanService } from 'src/modules/watchman/services/watchman.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSystemUserDto } from 'src/system-users/dto/create-system-user.dto';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { handleHttpClientError } from 'src/utils/http-error.util';

import { UserData } from '../entities/user-data.entity';
import {
  CustomersCreateDto,
  CustomersCreateResponseDto,
} from '../schemas/customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    private readonly maestroService: MaestroService,
    private readonly groupsService: BankUsersGroupsService,
    private readonly watchmanService: WatchmanService,
  ) {}

  async create(
    payload: CustomersCreateDto,
    partner: PartnerInfo,
  ): Promise<CustomersCreateResponseDto | undefined> {
    await this.validateGroupAccess(payload.groupId, partner);
    await this.validateUniqueUserData(payload, partner);

    const customerId = randomUUID();

    const bureauValidation = await this.watchmanService.bureauValidation(
      payload.taxpayer,
    );

    if (bureauValidation.result.basicData.taxIdStatus !== 'REGULAR') {
      throw new UnauthorizedException(
        'The submitted document is not in a regular status.',
      );
    }

    // payload.fullName = bureauValidation.result.basicData.name;

    const createPartnerCustomerDto = this.buildCreateBankUserDto(
      customerId,
      payload,
      partner,
    );

    try {
      await this.maestroService.createCustomer(
        customerId,
        payload.type,
        partner,
      );

      const userId = await this.createUserInTransaction(
        createPartnerCustomerDto,
        payload,
        customerId,
        partner,
      );

      return this.buildCreateResponse(userId, payload);
    } catch (error) {
      this.handleCreateError(error, partner);
    }
  }

  private async validateGroupAccess(
    groupId: string,
    partner: PartnerInfo,
  ): Promise<void> {
    const group = await this.groupsService.findOne(groupId);
    if (!group) {
      throw new UnauthorizedException('Group not found');
    }

    if (group.partnerId !== partner.id) {
      throw new UnauthorizedException('Unauthorized group access');
    }
  }

  private async validateUniqueUserData(
    payload: CustomersCreateDto,
    partner: PartnerInfo,
  ): Promise<void> {
    const { email, phoneNumber, username } = payload;
    const existingUserValues = [email, phoneNumber, username];

    const user = await this.checkUserDataValueExists(
      partner.id,
      existingUserValues,
      this.prismaService,
    );

    if (user) {
      throw new ConflictException(
        'Email or phone number or username already exists',
      );
    }
  }

  private buildCreateBankUserDto(
    customerId: string,
    payload: CustomersCreateDto,
    partner: PartnerInfo,
  ): CreateBankUserDto {
    return {
      user: {
        externalId: customerId,
      },
      groupId: payload.groupId,
      partnerId: partner.id,
      secret: payload.password,
    };
  }

  private async createUserInTransaction(
    createPartnerCustomerDto: CreateBankUserDto,
    payload: CustomersCreateDto,
    customerId: string,
    partner: PartnerInfo,
  ): Promise<string> {
    let userId: string = '';

    await this.prismaService.$transaction(async (tx) => {
      const systemUser = await this.createSystemUser(
        tx,
        createPartnerCustomerDto.user,
      );

      await this.createAuthentication(
        tx,
        createPartnerCustomerDto.secret,
        systemUser.id,
      );

      const entity = BankUser.fromDto(createPartnerCustomerDto);

      entity.userId = systemUser.id;
      entity.externalId = systemUser.externalId!;
      userId = systemUser.id;
      await this.insertBankUser(tx, entity);

      const userData = this.buildUserDataEntities(
        payload,
        entity.userId,
        customerId,
        partner.id,
      );

      await this.createUserData(tx, userData);
    });

    return userId;
  }

  private buildUserDataEntities(
    payload: CustomersCreateDto,
    userId: string,
    externalId: string,
    partnerId: string,
  ): UserData[] {
    const payloadKeys = Object.keys(payload) as Array<keyof CustomersCreateDto>;

    return payloadKeys.map((key) => {
      const item = {
        userId,
        externalId,
        partnerId,
        key: key as string,
        value: String(payload[key]),
      };
      return UserData.fromDto(item);
    });
  }

  private buildCreateResponse(
    id: string,
    payload: CustomersCreateDto,
  ): CustomersCreateResponseDto {
    const { email, fullName, phoneNumber, taxpayer, type, username } = payload;

    return {
      id,
      email,
      fullName,
      phoneNumber,
      taxpayer,
      type,
      username,
      createdAt: new Date().toISOString(),
    };
  }

  private handleCreateError(error: unknown, partner: PartnerInfo): never {
    this.logger.error(
      error,
      'Error creating bank user for partner: %s',
      partner.id,
    );

    if (this.isHttpErrorResponse(error)) {
      handleHttpClientError(error);
    }

    throw error;
  }

  private isHttpErrorResponse(error: unknown): error is HttpErrorResponse {
    return (
      error !== null &&
      typeof error === 'object' &&
      'status' in error &&
      'data' in error &&
      'name' in error &&
      'message' in error
    );
  }

  /**
   * Creates a new system user in the database within the provided transaction context.
   *
   * @param transaction - The Prisma transaction object used to perform the database operation.
   * @param user - The data transfer object containing the information required to create a system user.
   * @returns A promise that resolves to the created `SystemUser` instance.
   */
  private async createSystemUser(
    transaction: PrismaTransaction,
    user: CreateSystemUserDto,
  ): Promise<SystemUser> {
    const systemUser = SystemUser.fromDto(user);

    const data = await transaction.system_users.create({
      data: systemUser.toDB,
      select: {
        id: true,
        external_id: true,
      },
    });

    return SystemUser.fromDB(data);
  }

  /**
   * Inserts a new bank user record into the database within the given transaction.
   *
   * @param transaction - The Prisma transaction object used to perform the database operation.
   * @param entity - The BankUser entity containing the data to be inserted.
   * @returns A promise that resolves to an object containing the ID of the newly created bank user.
   */
  private async insertBankUser(
    transaction: PrismaTransaction,
    entity: BankUser,
  ): Promise<{ id: string }> {
    return await transaction.bank_users.create({
      data: entity.toDB,
      select: {
        id: true,
      },
    });
  }

  /**
   * Creates a new authentication record for a user with the provided secret.
   *
   * @param transaction - The Prisma transaction object used to perform the database operation.
   * @param secret - The plain text secret (e.g., password) to be hashed and stored.
   * @param id - The unique identifier of the user for whom the authentication is being created.
   * @returns A promise that resolves when the authentication record has been created.
   */
  private async createAuthentication(
    transaction: PrismaTransaction,
    secret: string,
    id: string,
  ): Promise<void> {
    const hashedSecret = await hash(secret, 10);

    await transaction.authentication.create({
      data: {
        user_id: id,
        secret: hashedSecret,
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Creates a new user data record for a user.
   *
   * @param transaction - The Prisma transaction object used to perform the database operation.
   * @param data - The UserData entity containing the data to be inserted.
   */
  private async createUserData(
    transaction: PrismaTransaction,
    entities: UserData[],
  ): Promise<void> {
    await transaction.users_data.createMany({
      data: entities.map((entity) => entity.toDB),
    });
  }

  /**
   * @param transaction - The Prisma transaction object used to perform the database operation.
   * @param partnerId - The id of the partner
   * @param existisEmailOrPhoneNumberOrUsername - The email or phone number or username
   * @param data - The UserData entity containing the data to be inserted.
   */
  private async checkUserDataValueExists(
    partnerId: string,
    existisEmailOrPhoneNumberOrUsername: string[],
    transaction: PrismaTransaction,
  ): Promise<UserData | null> {
    const result = await transaction.users_data.findFirst({
      where: {
        partner_id: partnerId,
        value: {
          in: existisEmailOrPhoneNumberOrUsername,
        },
      },
    });

    return result ? UserData.fromDB(result) : null;
  }
}
