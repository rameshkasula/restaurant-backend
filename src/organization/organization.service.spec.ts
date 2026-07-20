/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { getModelToken } from '@nestjs/mongoose';
import { Organization } from './schemas/organization.schema';
import { NotFoundException } from '@nestjs/common';

const mockOrganization = (
  id = '60d5ecb862d512a8a816174a',
  name = 'Acme Corp',
  createdAt = new Date(),
  isDeleted = false,
) => ({
  _id: id,
  name,
  createdAt,
  isDeleted,
  save: jest.fn().mockResolvedValue({ _id: id, name, createdAt, isDeleted }),
});

describe('OrganizationService', () => {
  let service: OrganizationService;
  let model: any;

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
        createdAt: new Date(),
        isDeleted: false,
      }),
    };
  });

  Object.assign(mockModelFactory, mockModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getModelToken(Organization.name),
          useValue: mockModelFactory,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    model = module.get(getModelToken(Organization.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const dto = { name: 'Acme Corp' };
      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result._id).toBe('60d5ecb862d512a8a816174a');
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findAll', () => {
    it('should return active organizations by default', async () => {
      const activeOrg = mockOrganization(
        '60d5ecb862d512a8a816174a',
        'Org 1',
        new Date(),
        false,
      );
      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([activeOrg]),
      });

      const result = await service.findAll();
      expect(model.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe(activeOrg._id);
    });

    it('should return all organizations including deleted when includeDeleted is true', async () => {
      const activeOrg = mockOrganization(
        '60d5ecb862d512a8a816174a',
        'Org 1',
        new Date(),
        false,
      );
      const deletedOrg = mockOrganization(
        '60d5ecb862d512a8a816174b',
        'Org 2',
        new Date(),
        true,
      );

      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([activeOrg, deletedOrg]),
      });

      const result = await service.findAll(true);
      expect(model.find).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should find an active organization', async () => {
      const org = mockOrganization(validId, 'Org', new Date(), false);
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(org),
      });

      const result = await service.findOne(validId);
      expect(model.findOne).toHaveBeenCalledWith({
        _id: validId,
        isDeleted: false,
      });
      expect(result._id).toBe(validId);
    });

    it('should throw NotFoundException for non-valid ObjectId', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if organization not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should soft delete the organization', async () => {
      const org = mockOrganization(validId, 'Org', new Date(), false);
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(org),
      });
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(org),
      });

      const result = await service.softDelete(validId);
      expect(result.message).toContain('soft deleted');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        validId,
        { isDeleted: true },
      );
    });
  });

  describe('restore', () => {
    const validId = '60d5ecb862d512a8a816174a';

    it('should restore a soft deleted organization', async () => {
      const deletedOrg = mockOrganization(
        validId,
        'Org',
        new Date(),
        true,
      );
      const restoredOrg = mockOrganization(validId, 'Org', new Date(), false);

      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedOrg),
      });
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(restoredOrg),
      });

      const result = await service.restore(validId);
      expect(result.isDeleted).toBe(false);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        validId,
        { isDeleted: false },
        { returnDocument: 'after' },
      );
    });

    it('should return immediately if organization is already active', async () => {
      const activeOrg = mockOrganization(validId, 'Org', new Date(), false);
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(activeOrg),
      });

      const result = await service.restore(validId);
      expect(result.isDeleted).toBe(false);
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
