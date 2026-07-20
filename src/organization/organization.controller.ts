/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    const shouldIncludeDeleted = includeDeleted === 'true';
    return this.organizationService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const shouldIncludeDeleted = includeDeleted === 'true';
    return this.organizationService.findOne(id, shouldIncludeDeleted);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.organizationService.softDelete(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.organizationService.restore(id);
  }
}
