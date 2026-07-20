import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMode } from '../enums/payment-mode.enum';

export class OrderItemDto {
  readonly menuItemId: string;
  readonly quantity: number;
  readonly price: number;
}

export class BillDto {
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly paymentMode?: PaymentMode | null;
  readonly paidAt?: Date | null;
}

export class CreateOrderDto {
  readonly outletId: string;
  readonly items: OrderItemDto[];
  readonly status?: OrderStatus;
  readonly bill: BillDto;
}
