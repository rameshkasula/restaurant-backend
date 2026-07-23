/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import dayjs from 'dayjs';
import { toPlainObject } from 'src/utils/mongoose.util';

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
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = {};

    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    if (outletId) {
      filter.outletId = new Types.ObjectId(outletId);
    }

    const skip = (page - 1) * limit;

    const start = startDate
      ? dayjs(startDate).startOf('day').toDate()
      : dayjs().subtract(7, 'day').startOf('day').toDate();

    const end = endDate
      ? dayjs(endDate).endOf('day').toDate()
      : dayjs().endOf('day').toDate();

    filter.createdAt = {
      $gte: start,
      $lte: end,
    };

    const [ordersList, total] = await Promise.all([
      this.orderModel
        .find(filter) // ✅ Use the filter here
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      this.orderModel.countDocuments(filter).exec(), // ✅ And here
    ]);

    const salesByMenuItems = await this.orderModel.aggregate([
      {
        $match: { ...filter, status: 'COMPLETED' },
      },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.menuItemId',
          totalQuantity: { $sum: '$items.quantity' },
          totalPrice: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          subtotal: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          tax: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          total: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },

      // need menuitem name and category
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem',
        },
      },
      {
        $unwind: '$menuItem',
      },
      {
        $project: {
          _id: 0,
          menuItemId: '$_id',
          name: '$menuItem.name',
          category: '$menuItem.category',
          totalQuantity: 1,
          totalPrice: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
    ]);

    const salesByPayments = await this.orderModel.aggregate([
      {
        $match: { ...filter, status: 'COMPLETED' },
      },
      {
        $unwind: '$bill.paymentMode',
      },
      {
        $group: {
          _id: '$bill.paymentMode',
          totalQuantity: { $sum: 1 },
          totalPrice: { $sum: '$bill.total' },
          subtotal: { $sum: '$bill.subtotal' },
          tax: { $sum: '$bill.tax' },
          total: { $sum: '$bill.total' },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMode: '$_id',
          totalQuantity: 1,
          totalPrice: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
    ]);

    const salesByStatus = await this.orderModel
      .aggregate([
        // total order based on the status
        {
          $match: { ...filter },
        },
        {
          $group: {
            _id: '$status',
            totalQuantity: { $sum: 1 },
            totalPrice: { $sum: '$bill.total' },
            subtotal: { $sum: '$bill.subtotal' },
            tax: { $sum: '$bill.tax' },
            total: { $sum: '$bill.total' },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            totalQuantity: 1,
            totalPrice: 1,
            subtotal: 1,
            tax: 1,
            total: 1,
          },
        },
        {
          $sort: { totalQuantity: -1 },
        },
      ])
      .exec();
    return {
      range: {
        startDate: start,
        endDate: end,
      },
      data: toPlainObject(ordersList),
      salesByMenuItems: toPlainObject(salesByMenuItems),
      salesByPayments: toPlainObject(salesByPayments),
      salesByStatus: toPlainObject(salesByStatus),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
