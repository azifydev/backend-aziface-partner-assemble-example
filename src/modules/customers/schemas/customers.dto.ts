/* eslint-disable max-lines */
import { ApiProperty, OmitType } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDate,
  IsDefined,
  IsBoolean,
  IsEmail,
  Matches,
} from 'class-validator';

import { CustomerPropertiesIsRequired } from '../@types/customer-property-is-required-enum';
import { CustomerPropertiesType } from '../@types/customer-property-type-enum';
import { UserType } from '../@types/user-type-enum';

import { KycStatusEnum } from './customer-maestro.dto';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

export enum CustomerStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export class CustomerSettingsDto {
  @ApiProperty() cashinAllowed: boolean;
  @ApiProperty() cashoutAllowed: boolean;
  @ApiProperty() depositAllowed: boolean;
  @ApiProperty() withdrawalAllowed: boolean;
  @ApiProperty() spbCashinAllowed: boolean;
  @ApiProperty() spbCashoutAllowed: boolean;
  @ApiProperty() spiCashinAllowed: boolean;
  @ApiProperty() spiCashoutAllowed: boolean;
  @ApiProperty() bookCashinAllowed: boolean;
  @ApiProperty() bookCashoutAllowed: boolean;
}

export class CustomersDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '8423320f-cfce-4e93-9a90-46c8604d8502',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.INDIVIDUAL,
  })
  @IsEnum(UserType)
  type: UserType;

  @ApiProperty({
    description: 'Access group identifier',
    example: 'd2f080fd-9da8-4250-9c66-78a74a8244c4',
  })
  @IsString()
  groupId: string;

  @ApiProperty({
    description: 'User CPF or CNPJ',
    example: '12345678900',
  })
  @IsString()
  taxpayer: string;

  @ApiProperty({
    enum: KycStatusEnum,
    description: 'Kyc Status of the customer',
    example: KycStatusEnum.APPROVED,
  })
  @IsEnum(KycStatusEnum)
  @IsOptional()
  kycStatus?: KycStatusEnum;

  @ApiProperty({
    description: 'User full name',
    example: 'João da Silva',
    required: false,
  })
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Username for login',
    example: 'joaosilva',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'SenhaForte123!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'User email address',
    example: 'joao@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+5511912345678',
  })
  @IsString()
  @Matches(/^\+55\d{10,11}$/, {
    message: 'O número de telefone deve estar no formato +55DDXXXXXXXXX',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Customer creation date',
    example: '2022-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Customer last update date',
    example: '2022-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}

export class CustomersPropertiesDto {
  @ApiProperty({
    description: 'Unique UUID identifier of the customer property',
    example: 'd2f080fd-9da8-4250-9c66-78a74a8244c4',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the customer property',
    example: 'Register Name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Slug of the customer property',
    example: 'registerName',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    enum: CustomerPropertiesType,
    example: CustomerPropertiesType.TEXT,
  })
  @IsEnum(CustomerPropertiesType)
  type: CustomerPropertiesType;

  @ApiProperty({
    description: 'Indicates whether the property is a group or not',
    example: 'true/false or 1/0',
  })
  @IsOptional()
  @IsDefined()
  isGroup?: boolean | number;

  @ApiProperty({
    description: 'Sets the selection options for the property',
    example: ['Option 1', 'Option 2', 'Option 3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectOptions?: string[] | null;

  @ApiProperty({
    enum: CustomerPropertiesIsRequired,
    example: CustomerPropertiesIsRequired.ENABLED,
    enumName: 'CustomerPropertiesIsRequired',
  })
  @IsEnum(CustomerPropertiesIsRequired)
  forIndividuals: CustomerPropertiesIsRequired;

  @ApiProperty({
    enum: CustomerPropertiesIsRequired,
    example: CustomerPropertiesIsRequired.ENABLED,
    enumName: 'CustomerPropertiesIsRequired',
  })
  @IsEnum(CustomerPropertiesIsRequired)
  forCorporates: CustomerPropertiesIsRequired;

  @ApiProperty({
    description: 'Defines the country related to the customer property',
    example: 'BR',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Parent property identifier of the customer property',
    example: 'd2f080fd-9da8-4250-9c66-78a74a8244c4',
  })
  @IsOptional()
  @IsString()
  parent?: string | null;

  @ApiProperty({
    description: 'Creation date of the customer property',
    example: '2024-07-03T20:39:33.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the customer property',
    example: '2024-07-03T20:39:33.000Z',
  })
  @IsDate()
  updatedAt: Date;
}

export class CustomersProfileDto {
  @ApiProperty({
    description: 'Unique UUID identifier of the profile',
    example: 'c12c1647-15de-475a-a44b-43b5f598c5fc',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the profile',
    example: 'PF',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Defines whether the profile is default or not',
    example: false,
  })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({
    description: 'Defines whether the profile is enabled or not',
    example: true,
  })
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({
    enum: CustomerType,
    example: CustomerType.INDIVIDUAL,
  })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({
    description: 'Defines the country related to the profile',
    example: 'BR',
  })
  @IsString()
  country: string;
}

export class CustomersCreateDto extends OmitType(CustomersDto, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {}

export class CustomersCreateResponseDto extends OmitType(CustomersDto, [
  'password',
  'groupId',
  'updatedAt',
] as const) {}
