import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'PREPARING', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  readonly status: OrderStatus;
}
