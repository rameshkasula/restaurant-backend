/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Patch,
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.organizationService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.organizationService.updateStatus(id, status);
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
