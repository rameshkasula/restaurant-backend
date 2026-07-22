/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OutletService } from './outlet.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';

@Controller('outlet')
export class OutletController {
  constructor(private readonly outletService: OutletService) {}

  @Post()
  create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletService.create(createOutletDto);
  }

  @Get()
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    const shouldIncludeDeleted = includeDeleted === 'true';
    return this.outletService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('includeDeleted') includeDeleted?: string) {
    const shouldIncludeDeleted = includeDeleted === 'true';
    return this.outletService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOutletDto: UpdateOutletDto) {
    return this.outletService.update(id, updateOutletDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.outletService.updateStatus(id, status);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.outletService.softDelete(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.outletService.restore(id);
  }
}
