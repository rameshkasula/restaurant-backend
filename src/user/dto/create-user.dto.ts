/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  readonly organizationId?: string | null;

  @IsString()
  @IsOptional()
  readonly outletId?: string | null;

  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly passwordHash: string;
}

