import { IsEnum, IsNotEmpty } from 'class-validator';
import { MenuItemStatus } from '../enums/menu-item-status.enum';

export class UpdateMenuItemStatusDto {
  @IsEnum(MenuItemStatus)
  @IsNotEmpty()
  readonly status: MenuItemStatus;
}
