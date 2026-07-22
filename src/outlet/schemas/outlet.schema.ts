/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OutletStatus } from '../enums/outlet-status.enum';

export type OutletDocument = HydratedDocument<Outlet>;

@Schema({ timestamps: true, versionKey: false })
export class Outlet {
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
  organizationId: Types.ObjectId | null;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, default: false })
  isCustomerapp: boolean;

  @Prop({ type: String, default: null })
  gstin: string | null;

  @Prop({ type: String, default: null })
  pan: string | null;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  @Prop({
    type: String,
    enum: OutletStatus,
    default: OutletStatus.ACTIVE,
  })
  status: OutletStatus;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);
