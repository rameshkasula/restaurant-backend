/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { hashPassword } from '../utils/hash.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const { email } = resendOtpDto;
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim(), isDeleted: false }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the OTP via email
    await this.mailService.sendPasswordResetOtp(email, otp);
    console.log(`[DEV] Generated OTP for ${email}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    const { email, otp } = verifyOtpDto;
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim(), isDeleted: false }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      return { message: 'User is already verified' };
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return { message: 'OTP verified successfully' };
  }

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

    // Check if verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your OTP first');
    }

    // Verify password hash
    const hashedPassword = hashPassword(password);
    if (user.passwordHash !== hashedPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token
    const token = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save token
    user.tokens.push(token);
    await user.save();

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
      token,
    };
  }
}
