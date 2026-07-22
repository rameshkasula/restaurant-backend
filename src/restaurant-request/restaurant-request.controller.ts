/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RestaurantRequestService } from './restaurant-request.service';
import { CreateRestaurantRequestDto } from './dto/create-restaurant-request.dto';
import { UpdateRestaurantRequestDto } from './dto/update-restaurant-request.dto';
import { RestaurantRequestResponseDto } from './dto/restaurant-request-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Restaurant Requests')
@Controller('restaurant-requests')
export class RestaurantRequestController {
  constructor(private readonly service: RestaurantRequestService) {}

  // POST /api/v1/restaurant-requests
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new restaurant partner request' })
  @ApiResponse({ status: 201, description: 'Request created successfully.', type: RestaurantRequestResponseDto })
  @ApiResponse({ status: 409, description: 'Email or phone already exists.' })
  async create(@Body() dto: CreateRestaurantRequestDto) {
    const result = await this.service.create(dto);
    return plainToInstance(RestaurantRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // GET /api/v1/restaurant-requests
  @Get()
  @ApiOperation({ summary: 'Get all restaurant partner requests' })
  @ApiResponse({ status: 200, description: 'List of all requests.', type: [RestaurantRequestResponseDto] })
  async findAll() {
    const result = await this.service.findAll();
    return plainToInstance(RestaurantRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // GET /api/v1/restaurant-requests/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single restaurant request by ID' })
  @ApiResponse({ status: 200, description: 'Request found.', type: RestaurantRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return plainToInstance(RestaurantRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // PATCH /api/v1/restaurant-requests/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant request by ID' })
  @ApiResponse({ status: 200, description: 'Request updated successfully.', type: RestaurantRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists.' })
  async update(@Param('id') id: string, @Body() dto: UpdateRestaurantRequestDto) {
    const result = await this.service.update(id, dto);
    return plainToInstance(RestaurantRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  // DELETE /api/v1/restaurant-requests/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a restaurant request by ID' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
