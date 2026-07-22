/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantRequestController } from './restaurant-request.controller';
import { RestaurantRequestService } from './restaurant-request.service';
import {
  RestaurantRequest,
  RestaurantRequestSchema,
} from './schemas/restaurant-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RestaurantRequest.name, schema: RestaurantRequestSchema },
    ]),
  ],
  controllers: [RestaurantRequestController],
  providers: [RestaurantRequestService],
  exports: [RestaurantRequestService],
})
export class RestaurantRequestModule {}
