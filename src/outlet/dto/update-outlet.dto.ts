/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { OutletStatus } from '../enums/outlet-status.enum';

export class UpdateOutletDto {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isCustomerapp?: boolean;

  @IsString()
  @IsOptional()
  gstin?: string;

  @IsString()
  @IsOptional()
  pan?: string;

  @IsEnum(OutletStatus)
  @IsOptional()
  status?: OutletStatus;
}
