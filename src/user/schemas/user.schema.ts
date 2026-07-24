/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', default: null })
  outletId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  otp: string | null;

  @Prop({ type: Date, default: null })
  otpExpiry: Date | null;

  @Prop({ type: [String], default: [] })
  tokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
