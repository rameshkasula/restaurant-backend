/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { toPlainObject } from '../utils/mongoose.util';
import { OrganizationStatus } from './enums/organization-status.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<any> {
    const newOrg = new this.organizationModel({
      name: createOrganizationDto.name,
      status: createOrganizationDto.status || undefined,
    });
    const saved = await newOrg.save();
    return toPlainObject(saved);
  }

  async findAll(includeDeleted = false): Promise<any[]> {
    const query = includeDeleted ? {} : { isDeleted: false };
    const orgs = await this.organizationModel.find(query).lean().exec();
    return toPlainObject(orgs);
  }

  async findOne(id: string, includeDeleted = false): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const org = await this.organizationModel.findOne(query).lean().exec();
    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return toPlainObject(org);
  }

  async update(id: string, updateDto: any): Promise<any> {
    const org = await this.findOne(id); // Throws 404 if not found or soft-deleted

    const updated = await this.organizationModel
      .findByIdAndUpdate(
        id,
        {
          name: updateDto.name !== undefined ? updateDto.name : org.name,
          status: updateDto.status !== undefined ? updateDto.status : org.status,
        },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return toPlainObject(updated);
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const normalizedStatus = status?.toLowerCase() as OrganizationStatus;
    if (!Object.values(OrganizationStatus).includes(normalizedStatus)) {
      throw new BadRequestException(`Invalid status value: ${status}`);
    }

    await this.findOne(id); // Throws 404 if not found or soft-deleted

    const updated = await this.organizationModel
      .findByIdAndUpdate(
        id,
        { status: normalizedStatus },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return toPlainObject(updated);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Throws 404 if not found or already deleted
    await this.organizationModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    return { message: `Organization with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<any> {
    const org = await this.findOne(id, true); // Include deleted to find it
    if (!org.isDeleted) {
      return org; // Already active
    }
    const restored = await this.organizationModel
      .findByIdAndUpdate(id, { isDeleted: false }, { returnDocument: 'after' })
      .lean()
      .exec();
    if (!restored) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return toPlainObject(restored);
  }
}
