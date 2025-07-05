import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionAction, PermissionModule } from '../roles/permissions.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Permissions(`${PermissionModule.PROJECT}.${PermissionAction.CREATE}`)
  @Post('create')
  create(@Body() dto: CreateProjectDto, @CurrentUser() currentUser: AuthUser) {
    return this.projectsService.create(dto, currentUser);
  }

  @Permissions(`${PermissionModule.PROJECT}.${PermissionAction.VIEW}`)
  @Get('list')
  findAll() {
    return this.projectsService.findAll();
  }

  @Permissions(`${PermissionModule.PROJECT}.${PermissionAction.UPDATE}`)
  @Patch('update/:id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto, @CurrentUser() currentUser: AuthUser) {
    return this.projectsService.update(id, updateProjectDto, currentUser);
  }
}