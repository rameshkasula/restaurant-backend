import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { OrganizationStatus } from '../enums/organization-status.enum';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;
}
