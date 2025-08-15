import { IsString, IsOptional } from 'class-validator';

export class UserDataDto {
  @IsString()
  userId: string;

  @IsString()
  partnerId: string;

  @IsOptional()
  @IsString()
  corporateId?: string;

  @IsString()
  externalId: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}
