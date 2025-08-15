import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';

import { HttpClientService } from 'src/http-client/http-client.service';
import { ConfigService } from '@nestjs/config';

import { BusinessPartnerDto } from 'src/business-partners/dto/bussiness-partner.dto';
import { faker } from '@faker-js/faker/.';

import { GenericFakeEntityFacade } from 'src/common/generators/entity-generator';

import { PrismaService } from 'src/prisma/prisma.service';

import { CustomersService } from './customers.service';
import { MaestroService } from 'src/modules/assemble/services/assemble.service';
import { BankUsersGroupsService } from 'src/bank-users-groups/bank-users-groups.service';
import { CustomersCreateDto } from '../schemas/customers.dto';
import { UserType } from '../@types/user-type-enum';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BankUsersGroupDto } from 'src/bank-users-groups/dto/bank-users-group.dto';
import { WatchmanService } from 'src/modules/watchman/services/watchman.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prismaService: PrismaService;

  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockHttpClient = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockPrismaService = {
    bank_users_groups: {
      findUnique: jest.fn(),
    },
    users_data: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockWatchman = {
    bureauValidation: jest.fn(),
  };

  const mockMaestro = {
    createCustomer: jest.fn(),
  };

  const mockCustomerCreateDto: CustomersCreateDto =
    GenericFakeEntityFacade.createBuilder<CustomersCreateDto>()
      .withBasicSchema({
        type: 'string',
        taxpayer: 'string',
        fullName: 'string',
        username: 'string',
        password: 'string',
        email: 'string',
        phoneNumber: 'string',
      } as const)
      .withFixedValues({
        type: UserType.INDIVIDUAL,
        taxpayer: faker.string.numeric(11),
        fullName: faker.person.fullName(),
        username: faker.internet.username(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phoneNumber: '+55' + faker.string.numeric(11),
      })
      .build() as CustomersCreateDto;

  const mockBankUsersGroupDto: BankUsersGroupDto =
    GenericFakeEntityFacade.createBuilder<BankUsersGroupDto>()
      .withBasicSchema({
        id: 'uuid',
        name: 'string',
        partnerId: 'uuid',
        createdAt: 'Date',
        updatedAt: 'Date',
        deletedAt: 'Date', // opcional
      } as const)
      .withFixedValues({
        id: `group-${faker.string.uuid()}`,
        name: faker.company.name(),
        partnerId: `partner-${faker.string.uuid()}`,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null, // ou faker.date.recent()
      })
      .build() as BankUsersGroupDto;

  const mockPartner: BusinessPartnerDto =
    GenericFakeEntityFacade.createBuilder<BusinessPartnerDto>()
      .withBasicSchema({
        id: 'string',
        name: 'string',
        externalIdMaestro: 'string',
        partnerIdWatchman: 'string',
        credentialsMaestro: 'string',
        createdAt: 'Date',
        updatedAt: 'Date',
      } as const)
      .withFixedValues({
        id: `partner-${faker.number.int({ min: 100, max: 999 })}`,
        externalIdMaestro: `maestro-${faker.string.uuid()}`,
        partnerIdWatchman: `watchman-${faker.string.uuid()}`,
        credentialsMaestro: {
          client_id: `client-${faker.internet.username()}`,
          client_secret: faker.internet.password(),
        },
        credentialsAziface: {
          client_id: `client-${faker.internet.username()}`,
          client_secret: faker.internet.password(),
        },
      })
      .build() as BusinessPartnerDto;

  const mockPartnerFromDB = {
    ...mockPartner,
    external_id_maestro: mockPartner.externalIdMaestro,
    partner_id_watchman: mockPartner.partnerIdWatchman,
    credentials_maestro: { ...mockPartner.credentialsMaestro },
    credentials_aziface: { ...mockPartner.credentialsAziface },
    created_at: mockPartner.createdAt,
    updated_at: mockPartner.updatedAt,
    deleted_at: undefined,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        ConfigService,
        BankUsersGroupsService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HttpClientService,
          useValue: mockHttpClient,
        },
        {
          provide: MaestroService,
          useValue: mockMaestro,
        },
        {
          provide: WatchmanService,
          useValue: mockWatchman,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw UnauthorizedException when group not found', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue(null);
      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow(new UnauthorizedException('Group not found'));
    });

    it('should throw UnauthorizedException when unauthorized group access', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue(
        mockBankUsersGroupDto,
      );
      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow(new UnauthorizedException('Unauthorized group access'));
    });

    it('should throw ConflictException when email or phone number or username already exists', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });
      mockPrismaService.users_data.findFirst.mockResolvedValue(true);
      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow(
        new ConflictException(
          'Email or phone number or username already exists',
        ),
      );
    });

    it('should create a new customer successfully', async () => {
      // Arrange
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });
      mockPrismaService.users_data.findFirst.mockResolvedValue(null);
      mockMaestro.createCustomer.mockResolvedValue({ error: null });

      mockWatchman.bureauValidation.mockResolvedValue({
        result: {
          basicData: {
            taxIdStatus: 'REGULAR',
            name: faker.person.fullName(),
          },
        },
      });

      const userId = faker.string.uuid();
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          system_users: {
            create: jest.fn().mockResolvedValue({
              id: userId,
              external_id: faker.string.uuid(),
            }),
          },
          authentication: {
            create: jest.fn().mockResolvedValue({ id: faker.string.uuid() }),
          },
          bank_users: {
            create: jest.fn().mockResolvedValue({ id: faker.string.uuid() }),
          },
          users_data: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return await callback(mockTx);
      });

      // Act
      const result = await service.create(
        mockCustomerCreateDto,
        mockPartnerFromDB,
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          type: expect.any(String),
          taxpayer: expect.any(String),
          fullName: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          phoneNumber: expect.any(String),
          createdAt: expect.any(String),
        }),
      );
    });

    it('should handle maestro service error', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });
      mockPrismaService.users_data.findFirst.mockResolvedValue(null);
      const maestroError = new Error('Maestro service error');
      mockMaestro.createCustomer.mockRejectedValue(maestroError);

      mockWatchman.bureauValidation.mockResolvedValue({
        result: {
          basicData: {
            taxIdStatus: 'REGULAR',
            name: faker.person.fullName(),
          },
        },
      });

      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow(maestroError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        maestroError,
        'Error creating bank user for partner: %s',
        mockPartnerFromDB.id,
      );
    });

    it('should handle HTTP error response', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });
      mockWatchman.bureauValidation.mockResolvedValue({
        result: {
          basicData: {
            taxIdStatus: 'REGULAR',
            name: faker.person.fullName(),
          },
        },
      });
      mockPrismaService.users_data.findFirst.mockResolvedValue(null);
      const httpError = {
        status: 400,
        data: { message: 'Bad request' },
        name: 'HttpErrorResponse',
        message: 'HTTP Error',
      };
      mockMaestro.createCustomer.mockRejectedValue(httpError);

      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        httpError,
        'Error creating bank user for partner: %s',
        mockPartnerFromDB.id,
      );
    });

    it('should throw BadRequestException when taxpayer is invalid', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });

      mockPrismaService.users_data.findFirst.mockResolvedValue(null);

      const error = {
        status: 400,
        data: { messages: 'TAXPAYER_INVALID' },
        name: 'HttpErrorResponse',
        message: 'HTTP Error',
      };
      mockWatchman.bureauValidation.mockRejectedValue(
        new BadRequestException('TAXPAYER_INVALID'),
      );

      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow('TAXPAYER_INVALID');
    });

    it('should throw UnauthorizedException when taxIdStatus is not REGULAR', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });

      mockPrismaService.users_data.findFirst.mockResolvedValue(null);

      mockWatchman.bureauValidation.mockResolvedValue({
        result: {
          basicData: {
            taxIdStatus: 'IRREGULAR',
            name: 'John Doe',
          },
        },
      });

      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow('The submitted document is not in a regular status.');
    });

    it('should handle transaction rollback on database error', async () => {
      mockPrismaService.bank_users_groups.findUnique.mockResolvedValue({
        ...mockBankUsersGroupDto,
        partner_id: mockPartnerFromDB.id,
      });
      mockPrismaService.users_data.findFirst.mockResolvedValue(null);
      mockMaestro.createCustomer.mockResolvedValue({ error: null });

      mockWatchman.bureauValidation.mockResolvedValue({
        result: {
          basicData: {
            taxIdStatus: 'REGULAR',
            name: faker.person.fullName(),
          },
        },
      });

      const dbError = new Error('Database transaction failed');
      mockPrismaService.$transaction.mockRejectedValue(dbError);

      await expect(
        service.create(mockCustomerCreateDto, mockPartnerFromDB),
      ).rejects.toThrow(dbError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        dbError,
        'Error creating bank user for partner: %s',
        mockPartnerFromDB.id,
      );
    });
  });

  describe('private methods', () => {
    let mockTransaction: any;

    beforeEach(() => {
      mockTransaction = {
        system_users: {
          create: jest.fn(),
        },
        authentication: {
          create: jest.fn(),
        },
        bank_users: {
          create: jest.fn(),
        },
        users_data: {
          createMany: jest.fn(),
          findFirst: jest.fn(),
        },
      };
    });

    it('should create system user', async () => {
      const mockSystemUserData = {
        id: faker.string.uuid(),
        external_id: faker.string.uuid(),
      };
      mockTransaction.system_users.create.mockResolvedValue(mockSystemUserData);

      const result = await (service as any).createSystemUser(mockTransaction, {
        externalId: mockSystemUserData.external_id,
      });

      expect(result).toBeDefined();
      expect(mockTransaction.system_users.create).toHaveBeenCalled();
    });

    it('should create authentication', async () => {
      const userId = faker.string.uuid();
      const secret = 'password123';
      mockTransaction.authentication.create.mockResolvedValue({
        id: faker.string.uuid(),
      });

      await (service as any).createAuthentication(
        mockTransaction,
        secret,
        userId,
      );

      expect(mockTransaction.authentication.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          secret: expect.any(String), // hashed password
        },
        select: {
          id: true,
        },
      });
    });

    it('should insert bank user', async () => {
      const mockBankUser = {
        toDB: {
          id: faker.string.uuid(),
          user_id: faker.string.uuid(),
          group_id: faker.string.uuid(),
          partner_id: faker.string.uuid(),
          external_id: faker.string.uuid(),
        },
      };
      mockTransaction.bank_users.create.mockResolvedValue({
        id: mockBankUser.toDB.id,
      });

      const result = await (service as any).insertBankUser(
        mockTransaction,
        mockBankUser,
      );

      expect(result).toEqual({ id: mockBankUser.toDB.id });
      expect(mockTransaction.bank_users.create).toHaveBeenCalledWith({
        data: mockBankUser.toDB,
        select: {
          id: true,
        },
      });
    });

    it('should create user data', async () => {
      const mockUserDataEntities = [
        {
          toDB: {
            user_id: faker.string.uuid(),
            external_id: faker.string.uuid(),
            partner_id: faker.string.uuid(),
            key: 'email',
            value: faker.internet.email(),
          },
        },
      ];
      mockTransaction.users_data.createMany.mockResolvedValue({ count: 1 });

      await (service as any).createUserData(
        mockTransaction,
        mockUserDataEntities,
      );

      expect(mockTransaction.users_data.createMany).toHaveBeenCalledWith({
        data: mockUserDataEntities.map((entity) => entity.toDB),
      });
    });

    it('should check if user data value exists', async () => {
      const partnerId = faker.string.uuid();
      const values = ['test@email.com', '+5511999999999', 'testuser'];
      const mockResult = {
        user_id: faker.string.uuid(),
        external_id: faker.string.uuid(),
        partner_id: partnerId,
        key: 'email',
        value: 'test@email.com',
      };
      mockTransaction.users_data.findFirst.mockResolvedValue(mockResult);

      const result = await (service as any).checkUserDataValueExists(
        partnerId,
        values,
        mockTransaction,
      );

      expect(result).toBeDefined();
      expect(mockTransaction.users_data.findFirst).toHaveBeenCalledWith({
        where: {
          partner_id: partnerId,
          value: {
            in: values,
          },
        },
      });
    });

    it('should return null when user data value does not exist', async () => {
      const partnerId = faker.string.uuid();
      const values = ['test@email.com', '+5511999999999', 'testuser'];
      mockTransaction.users_data.findFirst.mockResolvedValue(null);

      const result = await (service as any).checkUserDataValueExists(
        partnerId,
        values,
        mockTransaction,
      );

      expect(result).toBeNull();
    });

    it('should build user data entities', () => {
      const payload = {
        email: 'test@email.com',
        phoneNumber: '+5511999999999',
        username: 'testuser',
        fullName: 'Test User',
        type: UserType.INDIVIDUAL,
        taxpayer: '12345678901',
        password: 'password123',
        groupId: faker.string.uuid(),
      };
      const userId = faker.string.uuid();
      const externalId = faker.string.uuid();
      const partnerId = faker.string.uuid();

      const result = (service as any).buildUserDataEntities(
        payload,
        userId,
        externalId,
        partnerId,
      );

      expect(result).toHaveLength(Object.keys(payload).length);
      expect(result[0]).toMatchObject({
        userId,
        partnerId,
        key: expect.any(String),
        value: expect.any(String),
      });
    });

    it('should build create response', () => {
      const id = faker.string.uuid();
      const payload = mockCustomerCreateDto;

      const result = (service as any).buildCreateResponse(id, payload);

      expect(result).toEqual({
        id,
        email: payload.email,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        taxpayer: payload.taxpayer,
        type: payload.type,
        username: payload.username,
        createdAt: expect.any(String),
      });
    });

    it('should build create bank user dto', () => {
      const customerId = faker.string.uuid();
      const payload = mockCustomerCreateDto;
      const partner = mockPartnerFromDB;

      const result = (service as any).buildCreateBankUserDto(
        customerId,
        payload,
        partner,
      );

      expect(result).toEqual({
        user: {
          externalId: customerId,
        },
        groupId: payload.groupId,
        partnerId: partner.id,
        secret: payload.password,
      });
    });

    it('should identify HTTP error response correctly', () => {
      const httpError = {
        status: 400,
        data: { message: 'Bad request' },
        name: 'HttpErrorResponse',
        message: 'HTTP Error',
      };

      const isHttpError = (service as any).isHttpErrorResponse(httpError);
      expect(isHttpError).toBe(true);
    });

    it('should not identify non-HTTP error as HTTP error response', () => {
      const regularError = new Error('Regular error');

      const isHttpError = (service as any).isHttpErrorResponse(regularError);
      expect(isHttpError).toBe(false);
    });

    it('should handle createUserInTransaction', async () => {
      const createPartnerCustomerDto = {
        user: { externalId: faker.string.uuid() },
        groupId: faker.string.uuid(),
        partnerId: faker.string.uuid(),
        secret: 'password123',
      };
      const payload = mockCustomerCreateDto;
      const customerId = faker.string.uuid();
      const partner = mockPartnerFromDB;
      const userId = faker.string.uuid();

      // Mock the transaction callback
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          system_users: {
            create: jest.fn().mockResolvedValue({
              id: userId,
              external_id: customerId,
            }),
          },
          authentication: {
            create: jest.fn().mockResolvedValue({ id: faker.string.uuid() }),
          },
          bank_users: {
            create: jest.fn().mockResolvedValue({ id: faker.string.uuid() }),
          },
          users_data: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return await callback(mockTx);
      });

      const result = await (service as any).createUserInTransaction(
        createPartnerCustomerDto,
        payload,
        customerId,
        partner,
      );

      expect(result).toBe(userId);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
