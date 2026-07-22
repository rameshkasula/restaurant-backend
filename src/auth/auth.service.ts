/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { hashPassword } from '../utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    
    // Find active user
    const user = await this.userModel.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password hash
    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return basic session metadata and mock token
    return {
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId ? user.organizationId.toString() : null,
        outletId: user.outletId ? user.outletId.toString() : null,
      },
      token: Buffer.from(`${user.email}:${user.role}:${Date.now()}`).toString('base64'),
    };
  }
}
