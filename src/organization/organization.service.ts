/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const newOrg = new this.organizationModel({
      name: createOrganizationDto.name,
    });
    return newOrg.save();
  }

  async findAll(includeDeleted = false): Promise<Organization[]> {
    const query = includeDeleted ? {} : { isDeleted: false };
    return this.organizationModel.find(query).exec();
  }

  async findOne(id: string, includeDeleted = false): Promise<Organization> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const org = await this.organizationModel.findOne(query).exec();
    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return org;
  }

  async softDelete(id: string): Promise<{ message: string }> {
    await this.findOne(id); // Throws 404 if not found or already deleted
    await this.organizationModel
      .findByIdAndUpdate(id, { isDeleted: true })
      .exec();
    return { message: `Organization with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<Organization> {
    const org = await this.findOne(id, true); // Include deleted to find it
    if (!org.isDeleted) {
      return org; // Already active
    }
    const restored = await this.organizationModel
      .findByIdAndUpdate(id, { isDeleted: false }, { returnDocument: 'after' })
      .exec();
    if (!restored) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return restored;
  }
}
