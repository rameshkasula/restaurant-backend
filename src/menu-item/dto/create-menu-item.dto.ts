import { MenuItemCategory } from '../enums/menu-item-category.enum';

export class CreateMenuItemDto {
  readonly outletId: string;
  readonly category: MenuItemCategory;
  readonly name: string;
  readonly price: number;
  readonly isAvailable?: boolean;
  readonly stock?: number;
}
