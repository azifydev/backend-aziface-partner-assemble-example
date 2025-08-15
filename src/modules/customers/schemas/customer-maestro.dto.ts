import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum CustomerTypeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

export enum CustomerStatusEnum {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export enum KycStatusEnum {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  UNDER_ANALYSIS = 'UNDER_ANALYSIS',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  CUSTOMER_DENIED = 'CUSTOMER_DENIED',
  APPROVED = 'APPROVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CLOSED = 'CLOSED',
}

export class CustomerDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  secondaryName?: string | null;

  @IsEnum(CustomerTypeEnum)
  type: CustomerTypeEnum;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @IsEnum(CustomerStatusEnum)
  status: CustomerStatusEnum;

  @IsEnum(KycStatusEnum)
  kycStatus: KycStatusEnum;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
