import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateMenuItemStatusDto } from './dto/update-menu-item-status.dto';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemService.create(createMenuItemDto);
  }

  @Get()
  findAll(
    @Query('outletId') outletId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.menuItemService.findAll(outletId, includeDeleted === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemService.update(id, updateMenuItemDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateMenuItemStatusDto: UpdateMenuItemStatusDto,
  ) {
    return this.menuItemService.updateStatus(id, updateMenuItemStatusDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemService.softDelete(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.menuItemService.restore(id);
  }
}
