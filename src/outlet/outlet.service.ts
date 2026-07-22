/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Outlet, OutletDocument } from './schemas/outlet.schema';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { OrganizationService } from '../organization/organization.service';
import { toPlainObject } from '../utils/mongoose.util';
import { OutletStatus } from './enums/outlet-status.enum';

@Injectable()
export class OutletService {
  constructor(
    @InjectModel(Outlet.name)
    private readonly outletModel: Model<OutletDocument>,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(createOutletDto: CreateOutletDto): Promise<any> {
    if (createOutletDto.organizationId) {
      await this.organizationService.findOne(createOutletDto.organizationId);
    }

    const newOutlet = new this.outletModel({
      organizationId: createOutletDto.organizationId || null,
      name: createOutletDto.name,
      address: createOutletDto.address,
      isCustomerapp: createOutletDto.isCustomerapp ?? false,
      gstin: createOutletDto.gstin || null,
      pan: createOutletDto.pan || null,
      status: createOutletDto.status || undefined,
    });

    const saved = await newOutlet.save();
    return toPlainObject(saved);
  }

  async findAll(includeDeleted = false): Promise<any[]> {
    const query = includeDeleted ? {} : { isDeleted: false };
    const outlets = await this.outletModel.find(query).lean().exec();
    return toPlainObject(outlets);
  }

  async findOne(id: string, includeDeleted = false): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }
    const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const outlet = await this.outletModel.findOne(query).lean().exec();
    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }
    return toPlainObject(outlet);
  }

  async update(id: string, updateOutletDto: UpdateOutletDto): Promise<any> {
    const outlet = await this.outletModel
      .findOne({ _id: id, isDeleted: false })
      .lean()
      .exec();

    if (!outlet) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }

    if (updateOutletDto.organizationId) {
      await this.organizationService.findOne(updateOutletDto.organizationId);
    }

    const updated = await this.outletModel
      .findByIdAndUpdate(
        id,
        {
          organizationId:
            updateOutletDto.organizationId !== undefined
              ? updateOutletDto.organizationId || null
              : outlet.organizationId,
          name: updateOutletDto.name ?? outlet.name,
          address: updateOutletDto.address ?? outlet.address,
          isCustomerapp: updateOutletDto.isCustomerapp ?? outlet.isCustomerapp,
          gstin:
            updateOutletDto.gstin !== undefined
              ? updateOutletDto.gstin || null
              : outlet.gstin,
          pan:
            updateOutletDto.pan !== undefined
              ? updateOutletDto.pan || null
              : outlet.pan,
          status:
            updateOutletDto.status !== undefined
              ? updateOutletDto.status
              : outlet.status,
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }
    return toPlainObject(updated);
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const normalizedStatus = status?.toLowerCase() as OutletStatus;
    if (!Object.values(OutletStatus).includes(normalizedStatus)) {
      throw new BadRequestException(`Invalid status value: ${status}`);
    }

    await this.findOne(id); // Throws 404 if not found or soft-deleted

    const updated = await this.outletModel
      .findByIdAndUpdate(
        id,
        { status: normalizedStatus },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }
    return toPlainObject(updated);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Throws 404 if not found or already deleted
    await this.outletModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return { message: `Outlet with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<any> {
    const outlet = await this.findOne(id, true); // Find including deleted
    if (!outlet.isDeleted) {
      return outlet;
    }
    const restored = await this.outletModel
      .findByIdAndUpdate(id, { isDeleted: false }, { returnDocument: 'after' })
      .lean()
      .exec();
    if (!restored) {
      throw new NotFoundException(`Outlet with ID ${id} not found`);
    }
    return toPlainObject(restored);
  }
}
