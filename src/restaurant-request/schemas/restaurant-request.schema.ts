/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RestaurantRequestStatus } from '../enums/restaurant-request-status.enum';

export type RestaurantRequestDocument = RestaurantRequest & Document;

@Schema({ timestamps: true })
export class RestaurantRequest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  restaurantName: string;

  @Prop({ type: String, trim: true, default: null })
  city: string | null;

  @Prop({ type: String, trim: true, default: null })
  state: string | null;

  @Prop({ type: String, trim: true, default: null })
  message: string | null;

  @Prop({
    type: String,
    enum: RestaurantRequestStatus,
    default: RestaurantRequestStatus.WAITING_FOR_CALL,
  })
  status: RestaurantRequestStatus;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const RestaurantRequestSchema =
  SchemaFactory.createForClass(RestaurantRequest);
