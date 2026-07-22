/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantRequestDto } from './create-restaurant-request.dto';

export class UpdateRestaurantRequestDto extends PartialType(CreateRestaurantRequestDto) {}
