import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';

describe('MenuItemController', () => {
  let controller: MenuItemController;

  beforeEach(async () => {
    const mockMenuItemService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemController],
      providers: [
        {
          provide: MenuItemService,
          useValue: mockMenuItemService,
        },
      ],
    }).compile();

    controller = module.get<MenuItemController>(MenuItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
