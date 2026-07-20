import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel(createOrderDto);
    return createdOrder.save();
  }

  async findAll(
    outletId?: string,
    includeDeleted = false,
  ): Promise<Order[]> {
    const filter: any = {};
    if (!includeDeleted) {
      filter.isDeleted = false;
    }
    if (outletId) {
      filter.outletId = outletId;
    }
    return this.orderModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.orderModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateOrderDto, {
        new: true,
      })
      .exec();
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return updatedOrder;
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const order = await this.orderModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: `Order with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<Order> {
    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { isDeleted: false },
        { new: true },
      )
      .exec();
    if (!order) {
      throw new NotFoundException(`Deleted Order with ID ${id} not found`);
    }
    return order;
  }
}
