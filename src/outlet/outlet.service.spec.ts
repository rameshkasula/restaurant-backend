/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { OutletService } from './outlet.service';
import { getModelToken } from '@nestjs/mongoose';
import { Outlet } from './schemas/outlet.schema';
import { OrganizationService } from '../organization/organization.service';
import { NotFoundException } from '@nestjs/common';

const mockOutlet = (
  id = '60d5ecb862d512a8a816174a',
  name = 'Downtown Outlet',
  address = '123 Main St',
  organizationId = null,
  isCustomerapp = false,
  gstin = null,
  pan = null,
  isDeleted = false,
) => ({
  _id: id,
  name,
  address,
  organizationId,
  isCustomerapp,
  gstin,
  pan,
  isDeleted,
  save: jest.fn().mockResolvedValue({
    _id: id,
    name,
    address,
    organizationId,
    isCustomerapp,
    gstin,
    pan,
    isDeleted,
  }),
});

describe('OutletService', () => {
  let service: OutletService;
  let model: any;
  let organizationService: any;

  const mockQuery = (resolvedValue: any) => ({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolvedValue),
  });

  const mockModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockModelFactory = jest.fn().mockImplementation((dto) => {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: '60d5ecb862d512a8a816174a',
        name: dto.name,
        address: dto.address,
        organizationId: dto.organizationId || null,
        isCustomerapp: dto.isCustomerapp ?? false,
        gstin: dto.gstin || null,
        pan: dto.pan || null,
        isDeleted: false,
      }),
    };
  });

  Object.assign(mockModelFactory, mockModel);

  const mockOrganizationService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutletService,
        {
          provide: getModelToken(Outlet.name),
          useValue: mockModelFactory,
        },
        {
          provide: OrganizationService,
          useValue: mockOrganizationService,
        },
      ],
    }).compile();

    service = module.get<OutletService>(OutletService);
    model = module.get(getModelToken(Outlet.name));
    organizationService = module.get<OrganizationService>(OrganizationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an outlet without organizationId', async () => {
      const dto = { name: 'Outlet 1', address: 'Addr 1' };
      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result._id).toBe('60d5ecb862d512a8a816174a');
      expect(result.organizationId).toBeNull();
      expect(result.isCustomerapp).toBe(false);
      expect(organizationService.findOne).not.toHaveBeenCalled();
    });

    it('should create an outlet linked to an organization if it exists', async () => {
      const orgId = '60d5ecb862d512a8a816174f';
      const dto = {
        name: 'Outlet 1',
        address: 'Addr 1',
        organizationId: orgId,
        isCustomerapp: true,
        gstin: 'GSTIN123',
        pan: 'PAN123',
      };
      
      organizationService.findOne.mockResolvedValue({ _id: orgId, name: 'Acme' });

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(organizationService.findOne).toHaveBeenCalledWith(orgId);
    });

    it('should throw NotFoundException if organizationId does not exist', async () => {
      const orgId = 'non-existent-org';
      const dto = { name: 'Outlet 1', address: 'Addr 1', organizationId: orgId };
      
      organizationService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return active outlets by default', async () => {
      const activeOutlet = mockOutlet('60d5ecb862d512a8a816174a', 'Outlet 1', 'Addr 1');
      model.find.mockReturnValue(mockQuery([activeOutlet]));

      const result = await service.findAll();
      expect(model.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe(activeOutlet._id);
    });
  });

  describe('findOne', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should find an active outlet', async () => {
      const outlet = mockOutlet(validId, 'Outlet', 'Addr');
      model.findOne.mockReturnValue(mockQuery(outlet));

      const result = await service.findOne(validId);
      expect(model.findOne).toHaveBeenCalledWith({ _id: validId, isDeleted: false });
      expect(result._id).toBe(validId);
    });

    it('should throw NotFoundException for non-valid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should update the outlet', async () => {
      const outlet = mockOutlet(validId, 'Outlet', 'Addr');
      const updatedOutlet = mockOutlet(validId, 'Outlet New', 'Addr New');
      
      model.findOne.mockReturnValue(mockQuery(outlet));
      model.findByIdAndUpdate.mockReturnValue(mockQuery(updatedOutlet));

      const result = await service.update(validId, { name: 'Outlet New', address: 'Addr New' });
      expect(result.name).toBe('Outlet New');
    });
  });

  describe('softDelete', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should soft delete the outlet', async () => {
      const outlet = mockOutlet(validId, 'Outlet', 'Addr');
      model.findOne.mockReturnValue(mockQuery(outlet));
      model.findByIdAndUpdate.mockReturnValue(mockQuery(outlet));

      const result = await service.softDelete(validId);
      expect(result.message).toContain('soft deleted');
    });
  });

  describe('restore', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should restore a soft deleted outlet', async () => {
      const deletedOutlet = mockOutlet(validId, 'Outlet', 'Addr', null, false, null, null, true);
      const restoredOutlet = mockOutlet(validId, 'Outlet', 'Addr', null, false, null, null, false);

      model.findOne.mockReturnValue(mockQuery(deletedOutlet));
      model.findByIdAndUpdate.mockReturnValue(mockQuery(restoredOutlet));

      const result = await service.restore(validId);
      expect(result.isDeleted).toBe(false);
    });
  });
});
