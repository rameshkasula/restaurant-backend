import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemStatus } from './enums/menu-item-status.enum';
import { toPlainObject } from '../utils/mongoose.util';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<any> {
    const createdMenuItem = new this.menuItemModel(createMenuItemDto);
    const saved = await createdMenuItem.save();
    return toPlainObject(saved);
  }

  async findAll(
    outletId?: string,
    includeDeleted = false,
  ): Promise<any[]> {
    const filter: any = {};
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    if (outletId) {
      filter.outletId = outletId;
    }
    const items = await this.menuItemModel.find(filter).exec();
    return toPlainObject(items);
  }

  async findOne(id: string): Promise<any> {
    const menuItem = await this.menuItemModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return toPlainObject(menuItem);
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<any> {
    const updatedMenuItem = await this.menuItemModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateMenuItemDto, {
        new: true,
      })
      .exec();
    if (!updatedMenuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return toPlainObject(updatedMenuItem);
  }

  async updateStatus(id: string, status: MenuItemStatus): Promise<any> {
    const updatedMenuItem = await this.menuItemModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { status },
        { new: true },
      )
      .exec();
    if (!updatedMenuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return toPlainObject(updatedMenuItem);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const menuItem = await this.menuItemModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true })
      .exec();
    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return { message: `MenuItem with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<any> {
    const menuItem = await this.menuItemModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { isDeleted: false },
        { new: true },
      )
      .exec();
    if (!menuItem) {
      throw new NotFoundException(`Deleted MenuItem with ID ${id} not found`);
    }
    return toPlainObject(menuItem);
  }
}
