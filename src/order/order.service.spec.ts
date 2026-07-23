import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { Order } from './schemas/order.schema';
import dayjs from 'dayjs';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderModel: any;

  beforeEach(async () => {
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    const mockCountQuery = {
      exec: jest.fn().mockResolvedValue(0),
    };

    const mockAggregate = jest.fn().mockImplementation(() => {
      const p = Promise.resolve([]);
      (p as any).exec = jest.fn().mockResolvedValue([]);
      return p;
    });

    mockOrderModel = {
      find: jest.fn().mockReturnValue(mockQuery),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      countDocuments: jest.fn().mockReturnValue(mockCountQuery),
      aggregate: mockAggregate,
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should use default 7 days date range when no dates are provided', async () => {
      const now = new Date();
      jest.useFakeTimers({ now });

      await service.findAll();

      const expectedStartDate = dayjs(now).subtract(7, 'day').startOf('day').toDate();
      const expectedEndDate = dayjs(now).endOf('day').toDate();

      expect(mockOrderModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: {
            $gte: expectedStartDate,
            $lte: expectedEndDate,
          },
        }),
      );

      jest.useRealTimers();
    });

    it('should use custom start and end dates when provided', async () => {
      const startDateStr = '2026-07-01';
      const endDateStr = '2026-07-15';

      await service.findAll(undefined, false, 1, 10, startDateStr, endDateStr);

      const expectedStartDate = dayjs(startDateStr).startOf('day').toDate();
      const expectedEndDate = dayjs(endDateStr).endOf('day').toDate();

      expect(mockOrderModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: {
            $gte: expectedStartDate,
            $lte: expectedEndDate,
          },
        }),
      );
    });
  });
});
