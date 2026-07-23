/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly organizationId?: string | null;

  @IsString()
  @IsOptional()
  readonly outletId?: string | null;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly passwordHash?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  readonly status?: UserStatus;
}

