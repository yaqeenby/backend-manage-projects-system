import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionAction, PermissionModule } from '../roles/permissions.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Permissions(`${PermissionModule.ORGANIZATION}.${PermissionAction.CREATE}`)
  @Post('create')
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() currentUser: AuthUser) {
    return this.organizationService.create(dto, currentUser);
  }

  @Permissions(`${PermissionModule.ORGANIZATION}.${PermissionAction.VIEW}`)
  @Get('list')
  findAll() {
    return this.organizationService.findAll();
  }
  
  @Permissions(`${PermissionModule.ORGANIZATION}.${PermissionAction.UPDATE}`)
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto, @CurrentUser() currentUser: AuthUser
  ) {
    return this.organizationService.update(id, dto, currentUser);
  }
}
