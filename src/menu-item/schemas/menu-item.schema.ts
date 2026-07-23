import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MenuItemCategory } from '../enums/menu-item-category.enum';
import { MenuItemStatus } from '../enums/menu-item-status.enum';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: MenuItemCategory })
  category: MenuItemCategory;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: true })
  isAvailable: boolean;

  @Prop({ required: true, default: 10 })
  stock: number;

  @Prop({
    required: true,
    type: String,
    enum: MenuItemStatus,
    default: MenuItemStatus.ACTIVE,
  })
  status: MenuItemStatus;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
