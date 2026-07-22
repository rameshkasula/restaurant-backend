/* eslint-disable prettier/prettier */
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantRequestStatus } from '../enums/restaurant-request-status.enum';

export class CreateRestaurantRequestDto {
  @ApiProperty({ example: 'Ramesh Kumar', description: 'Contact person full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ramesh@spicegarden.com', description: 'Unique business email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+919876543210', description: 'Unique contact phone number' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(15)
  phone: string;

  @ApiProperty({ example: 'Spice Garden Restaurant', description: 'Name of the restaurant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  restaurantName: string;

  @ApiProperty({ example: 'Hyderabad', description: 'City where the restaurant is located', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'Telangana', description: 'State where the restaurant is located', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ example: 'We have 3 branches and looking to scale with POS integration.', description: 'Optional message from the requester', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;

  @ApiProperty({
    example: 'still waiting for call',
    description: 'Status of the request',
    enum: RestaurantRequestStatus,
    required: false,
  })
  @IsEnum(RestaurantRequestStatus)
  @IsOptional()
  status?: RestaurantRequestStatus;
}
