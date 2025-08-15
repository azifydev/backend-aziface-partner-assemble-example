/* eslint-disable max-lines */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { AllCountryPhoneCodesEnum } from '../@types/countries-type';

export class PhoneDto {
  @ApiProperty({
    enum: AllCountryPhoneCodesEnum,
    description: 'Country Code',
    example: AllCountryPhoneCodesEnum.BRAZIL,
  })
  @IsEnum(AllCountryPhoneCodesEnum)
  countryCode: AllCountryPhoneCodesEnum;

  @ApiProperty({
    description: 'Number Phone',
    example: '11987654321',
  })
  @IsString()
  number: string;
}

export class AddressDto {
  @ApiProperty({
    description: 'Address',
    example: '123 Main St',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'ZipCode',
    example: '12345-678',
  })
  @IsString()
  zipcode: string;

  @ApiProperty({
    description: 'Complement',
    example: 'Apt 456',
  })
  @IsString()
  complement: string;

  @ApiProperty({
    description: 'City',
    example: 'São Paulo',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'São Paulo',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'Brazil',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Number',
    example: '123',
  })
  @IsString()
  buildingNumber: string;

  @ApiProperty({
    description: 'Neighborhood',
    example: 'Downtown',
  })
  @IsString()
  neighborhood: string;
}

/**
 * DTO: Aliases
 */
export class AliasesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commonName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  standardizedName?: string;
}

/**
 * DTO: BasicData (usado em result.basicData e registrationData.basicData)
 */
export class BasicDataDto {
  @ApiProperty()
  @IsString()
  taxIdNumber: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  capturedBirthDateFromRFSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isValidBirthDateInRFSource?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxIdStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  taxIdStatusDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => AliasesDto)
  aliases?: AliasesDto;
}

/**
 * DTO: Email
 */
export class EmailDto {
  @ApiProperty()
  @IsString()
  emailAddress: string;

  @ApiProperty()
  @IsString()
  domain: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsDateString()
  lastUpdateDate: string;
}

/**
 * DTO: Address
 */
export class AddressBureauDto {
  @ApiProperty()
  @IsString()
  typology: string;

  @ApiProperty()
  @IsString()
  addressMain: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  complement: string;

  @ApiProperty()
  @IsString()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  complementType: string;

  @ApiProperty()
  @IsDateString()
  lastUpdateDate: string;
}

/**
 * DTO: Phone
 */
export class PhoneBureauDto {
  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  areaCode: string;

  @ApiProperty({
    enum: AllCountryPhoneCodesEnum,
    example: AllCountryPhoneCodesEnum.BRAZIL,
  })
  @IsEnum(AllCountryPhoneCodesEnum)
  countryCode: AllCountryPhoneCodesEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsDateString()
  lastUpdateDate: string;
}

/**
 * DTO: RegistrationData
 */
export class RegistrationDataDto {
  @ApiProperty({ type: BasicDataDto })
  @Type(() => BasicDataDto)
  basicData: BasicDataDto;

  @ApiPropertyOptional({ type: EmailDto })
  @IsOptional()
  @Type(() => EmailDto)
  emails?: { primary?: EmailDto; secondary?: Record<string, unknown> };

  @ApiPropertyOptional({ type: AddressBureauDto })
  @IsOptional()
  @Type(() => AddressBureauDto)
  addresses?: { primary?: AddressBureauDto; secondary?: AddressBureauDto };

  @ApiPropertyOptional({ type: PhoneBureauDto })
  @IsOptional()
  @Type(() => PhoneBureauDto)
  phones?: { primary?: PhoneBureauDto; secondary?: Record<string, unknown> };
}

/**
 * DTO: Result
 */
export class WatchmanBureauResultDto {
  @ApiProperty({ type: BasicDataDto })
  @Type(() => BasicDataDto)
  basicData: BasicDataDto;

  @ApiProperty({ type: RegistrationDataDto })
  @Type(() => RegistrationDataDto)
  registrationData: RegistrationDataDto;
}

/**
 * DTO final: Resposta do Endpoint
 */
export class WatchmanBureauResponseDto {
  @ApiProperty({ type: WatchmanBureauResultDto })
  @Type(() => WatchmanBureauResultDto)
  result: WatchmanBureauResultDto;

  @ApiProperty()
  @IsBoolean()
  isValid: boolean;
}
