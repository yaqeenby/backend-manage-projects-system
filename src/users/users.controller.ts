import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionAction, PermissionModule } from '../roles/permissions.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(`${PermissionModule.USER}.${PermissionAction.CREATE}`)
  @Post('create')
  create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: AuthUser) {
    return this.usersService.create(dto, currentUser);
  }

  @Permissions(`${PermissionModule.USER}.${PermissionAction.VIEW}`)
  @Get('list')
  findAll() {
    return this.usersService.findAll();
  }

  @Permissions(`${PermissionModule.USER}.${PermissionAction.VIEW}`)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Permissions(`${PermissionModule.USER}.${PermissionAction.UPDATE}`)
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() currentUser: AuthUser) {
    return this.usersService.update(id, dto, currentUser);
  }

  // @Delete('delete:id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(id);
  // }
}
