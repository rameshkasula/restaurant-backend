import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MenuItemCategory } from '../enums/menu-item-category.enum';
import { MenuItemStatus } from '../enums/menu-item-status.enum';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  readonly outletId: string;

  @IsEnum(MenuItemCategory)
  @IsNotEmpty()
  readonly category: MenuItemCategory;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsBoolean()
  @IsOptional()
  readonly isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  readonly stock?: number;

  @IsEnum(MenuItemStatus)
  @IsOptional()
  readonly status?: MenuItemStatus;
}
