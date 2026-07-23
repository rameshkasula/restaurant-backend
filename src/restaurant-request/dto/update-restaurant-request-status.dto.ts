import { IsEnum, IsNotEmpty } from 'class-validator';
import { RestaurantRequestStatus } from '../enums/restaurant-request-status.enum';

export class UpdateRestaurantRequestStatusDto {
  @IsEnum(RestaurantRequestStatus)
  @IsNotEmpty()
  readonly status: RestaurantRequestStatus;
}
