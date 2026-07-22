/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { OutletStatus } from '../enums/outlet-status.enum';

export class CreateOutletDto {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

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
