/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutletController } from './outlet.controller';
import { OutletService } from './outlet.service';
import { Outlet, OutletSchema } from './schemas/outlet.schema';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Outlet.name, schema: OutletSchema }]),
    OrganizationModule,
  ],
  controllers: [OutletController],
  providers: [OutletService],
  exports: [OutletService],
})
export class OutletModule {}
