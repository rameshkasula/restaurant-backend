/* eslint-disable prettier/prettier */
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RestaurantRequestStatus } from '../enums/restaurant-request-status.enum';

export class RestaurantRequestResponseDto {
  @ApiProperty({ example: '6a60eb7eb8b35358f1ffc6cf', description: 'Unique request ID' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ example: 'Ramesh Kumar', description: 'Contact person full name' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'ramesh@spicegarden.com', description: 'Unique business email address' })
  @Expose()
  email: string;

  @ApiProperty({ example: '+919876543210', description: 'Unique contact phone number' })
  @Expose()
  phone: string;

  @ApiProperty({ example: 'Spice Garden Restaurant', description: 'Name of the restaurant' })
  @Expose()
  restaurantName: string;

  @ApiProperty({ example: 'Hyderabad', description: 'City where the restaurant is located' })
  @Expose()
  city: string | null;

  @ApiProperty({ example: 'Telangana', description: 'State where the restaurant is located' })
  @Expose()
  state: string | null;

  @ApiProperty({ example: 'We have 3 branches and looking to scale.', description: 'Optional message' })
  @Expose()
  message: string | null;

  @ApiProperty({
    example: 'still waiting for call',
    description: 'Status of the request',
    enum: RestaurantRequestStatus,
  })
  @Expose()
  status: RestaurantRequestStatus;

  @ApiProperty({ example: '2026-07-22T16:10:38.900Z', description: 'Creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-07-22T16:10:38.900Z', description: 'Last update date' })
  @Expose()
  updatedAt: Date;
}
