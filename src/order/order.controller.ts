import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(
    @Query('outletId') outletId?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.findAll(
      outletId,
      includeDeleted === 'true',
      1,
      10,
      startDate,
      endDate,
    );
  }

  // sales api
  @Get('/sales')
  findSales(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('outletId') outletId?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.salesSummary(
      outletId,
      includeDeleted === 'true',
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.softDelete(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.orderService.restore(id);
  }
}
