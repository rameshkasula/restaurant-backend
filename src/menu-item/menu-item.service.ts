import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const createdMenuItem = new this.menuItemModel(createMenuItemDto);
    return createdMenuItem.save();
  }

  async findAll(
    outletId?: string,
    includeDeleted = false,
  ): Promise<MenuItem[]> {
    const filter: any = {};
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    if (outletId) {
      filter.outletId = outletId;
    }
    return this.menuItemModel.find(filter).exec();
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!menuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    const updatedMenuItem = await this.menuItemModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateMenuItemDto, {
        new: true,
      })
      .exec();
    if (!updatedMenuItem) {
      throw new NotFoundException(`MenuItem with ID ${id} not found`);
    }
    return updatedMenuItem;
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

  async restore(id: string): Promise<MenuItem> {
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
    return menuItem;
  }
}
