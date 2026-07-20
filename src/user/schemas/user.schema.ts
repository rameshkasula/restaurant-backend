import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

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

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
