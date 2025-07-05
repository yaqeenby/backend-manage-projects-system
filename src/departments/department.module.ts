import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../departments/department.entity';
import { Organization } from 'src/organizations/organization.entity';
import { DepartmentValidatorService } from './department-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Organization])],
  controllers: [DepartmentController],
  providers: [DepartmentService, DepartmentValidatorService],
  exports: [DepartmentService, DepartmentValidatorService],
})
export class DepartmentModule {}
