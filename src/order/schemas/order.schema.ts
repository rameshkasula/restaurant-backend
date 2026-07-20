import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMode } from '../enums/payment-mode.enum';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menuItemId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class Bill {
  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: PaymentMode, default: null })
  paymentMode: PaymentMode | null;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;
}
export const BillSchema = SchemaFactory.createForClass(Bill);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true })
  outletId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: BillSchema, required: true })
  bill: Bill;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
