/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { toPlainObject } from '../utils/mongoose.util';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const created = new this.userModel({
      organizationId: createUserDto.organizationId ?? null,
      outletId: createUserDto.outletId ?? null,
      role: createUserDto.role,
      email: createUserDto.email,
      passwordHash: createUserDto.passwordHash,
    });
    const saved = await created.save();
    return toPlainObject(saved);
  }

  async findAll(includeDeleted = false): Promise<any[]> {
    const filter = includeDeleted ? {} : { isDeleted: false };
    const users = await this.userModel.find(filter).lean().exec();
    return toPlainObject(users);
  }

  async findOne(id: string, includeDeleted = false): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const filter = includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const user = await this.userModel.findOne(filter).lean().exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return toPlainObject(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          ...(updateUserDto.organizationId !== undefined && { organizationId: updateUserDto.organizationId ?? null }),
          ...(updateUserDto.outletId !== undefined && { outletId: updateUserDto.outletId ?? null }),
          ...(updateUserDto.role !== undefined && { role: updateUserDto.role }),
          ...(updateUserDto.email !== undefined && { email: updateUserDto.email }),
          ...(updateUserDto.passwordHash !== undefined && { passwordHash: updateUserDto.passwordHash }),
        },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return toPlainObject(updated);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true })
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const restored = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { isDeleted: false },
        { new: true },
      )
      .lean()
      .exec();
    if (!restored) {
      throw new NotFoundException(`Deleted User with ID ${id} not found`);
    }
    return toPlainObject(restored);
  }
}


