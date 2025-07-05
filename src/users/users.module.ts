// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Department } from '../departments/department.entity';
import { Role } from '../roles/role.entity';
import { UserValidatorService } from './user-validator.service';
import { Organization } from '../organizations/organization.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Department, Organization, Notification])
  ],
  controllers: [UsersController],
  providers: [UsersService, UserValidatorService],
  exports: [UsersService, TypeOrmModule, UserValidatorService],
})
export class UsersModule {}
