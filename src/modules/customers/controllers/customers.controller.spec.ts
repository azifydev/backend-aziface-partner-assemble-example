import { Test, TestingModule } from '@nestjs/testing';

import {
  PartnerApiKeyGuard,
  PartnerInfo,
} from 'src/authentication/guards/partner-api-key.guard';
import { generateMock } from 'src/common/generators/generic-mock.generator';
import { MockType } from 'src/common/types/mock-like-object';

import { faker } from '@faker-js/faker/.';

import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';
import {
  CustomersCreateDto,
  CustomersCreateResponseDto,
} from '../schemas/customers.dto';
import { UserType } from '../@types/user-type-enum';
import { UnauthorizedException } from '@nestjs/common';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: MockType<CustomersService>;

  const partner: PartnerInfo = {
    id: faker.string.uuid(),
    name: faker.company.name(),
    external_id_maestro: faker.string.uuid(),
    credentials_maestro: {
      client_id: faker.string.uuid(),
      client_secret: faker.string.uuid(),
    },
  };

  const customer: CustomersCreateDto = {
    type: UserType.INDIVIDUAL,
    groupId: faker.string.uuid(),
    taxpayer: faker.string.numeric(11),
    fullName: faker.person.fullName(),
    username: faker.internet.username(),
    password: faker.internet.password({
      length: 12,
      memorable: true,
      pattern: /[A-Za-z0-9!@#\$%\^&\*]/,
    }),
    email: faker.internet.email(),
    phoneNumber:
      '+' + faker.string.numeric({ length: 13, allowLeadingZeros: true }),
  };

  beforeEach(async () => {
    service = generateMock<CustomersService>({
      $mockedKeys: ['create'],
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: service }],
    })
      .overrideGuard(PartnerApiKeyGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCustomer', () => {
    const { password, groupId, ...safeCustomer } = customer;
    const data: CustomersCreateResponseDto = {
      id: faker.string.uuid(),
      createdAt: new Date().toISOString(),
      ...safeCustomer,
    };
    it('should create a customer', async () => {
      service.create.mockResolvedValue({
        ...data,
      });
      const result = await controller.create(customer, partner);
      expect(result).toMatchObject(data);
      expect(service.create).toHaveBeenCalledWith(customer, partner);
    });

    it('should throw NotFoundException on service error', async () => {
      service.create.mockRejectedValue(new UnauthorizedException());
      await expect(controller.create(customer, partner)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
