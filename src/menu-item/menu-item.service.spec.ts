import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuItemService } from './menu-item.service';
import { MenuItem } from './schemas/menu-item.schema';

describe('MenuItemService', () => {
  let service: MenuItemService;

  beforeEach(async () => {
    const mockMenuItemModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        {
          provide: getModelToken(MenuItem.name),
          useValue: mockMenuItemModel,
        },
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
