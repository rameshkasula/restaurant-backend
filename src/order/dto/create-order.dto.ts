import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMode } from '../enums/payment-mode.enum';

export class OrderItemDto {
  @ApiProperty({ example: '64b1f4c3f5d6f8a1c2b3d4e5', description: 'ID of the menu item' })
  @IsString()
  @IsNotEmpty()
  readonly menuItemId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the item' })
  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number;

  @ApiProperty({ example: 250, description: 'Price per item' })
  @IsNumber()
  @IsNotEmpty()
  readonly price: number;
}

export class BillDto {
  @ApiProperty({ example: 500, description: 'Subtotal amount' })
  @IsNumber()
  @IsNotEmpty()
  readonly subtotal: number;

  @ApiProperty({ example: 25, description: 'Tax amount' })
  @IsNumber()
  @IsNotEmpty()
  readonly tax: number;

  @ApiProperty({ example: 525, description: 'Total amount' })
  @IsNumber()
  @IsNotEmpty()
  readonly total: number;

  @ApiProperty({ example: 'CASH', enum: PaymentMode, required: false, nullable: true })
  @IsEnum(PaymentMode)
  @IsOptional()
  readonly paymentMode?: PaymentMode | null;

  @ApiProperty({ example: '2026-07-23T12:00:00.000Z', required: false, nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly paidAt?: Date | null;
}

export class CreateOrderDto {
  @ApiProperty({ example: '64b1f4c3f5d6f8a1c2b3d4e6', description: 'ID of the outlet' })
  @IsString()
  @IsNotEmpty()
  readonly outletId: string;

  @ApiProperty({ type: [OrderItemDto], description: 'List of items in the order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  readonly items: OrderItemDto[];

  @ApiProperty({ example: 'PENDING', enum: OrderStatus, required: false })
  @IsEnum(OrderStatus)
  @IsOptional()
  readonly status?: OrderStatus;

  @ApiProperty({ type: BillDto, description: 'Bill details' })
  @IsObject()
  @ValidateNested()
  @Type(() => BillDto)
  readonly bill: BillDto;
}
