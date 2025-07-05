import { CreateDepartmentDto } from './dto/create-department.dto';
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionAction, PermissionModule } from '../roles/permissions.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @Permissions(`${PermissionModule.DEPARTMENT}.${PermissionAction.CREATE}`)
  @Post('create')
  async create(@Body() dto: CreateDepartmentDto, @CurrentUser() currentUser: AuthUser) {
    return this.departmentService.create(dto, currentUser);
  }

  @Permissions(`${PermissionModule.DEPARTMENT}.${PermissionAction.VIEW}`)  
  @Get('list')
  async findAll() {
    return this.departmentService.findAll();
  }

  @Permissions(`${PermissionModule.DEPARTMENT}.${PermissionAction.VIEW}`)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.departmentService.findById(id);
  }

  @Permissions(`${PermissionModule.DEPARTMENT}.${PermissionAction.UPDATE}`)
  @Patch('update:id')
  async update(@Param('id') id: string, @Body() dto: CreateDepartmentDto, @CurrentUser() currentUser: AuthUser) {
    return this.departmentService.update(id, dto, currentUser);
  }
}
