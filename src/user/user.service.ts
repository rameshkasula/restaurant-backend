import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(includeDeleted = false): Promise<User[]> {
    const filter = includeDeleted ? {} : { isDeleted: false };
    return this.userModel.find(filter).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateUserDto, {
        new: true,
      })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<User> {
    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { isDeleted: false },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException(`Deleted User with ID ${id} not found`);
    }
    return user;
  }
}
