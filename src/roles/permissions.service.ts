// src/roles/permissions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async findOrCreate(data: { module: string; action: string }): Promise<Permission> {
    let permission = await this.permissionRepo.findOneBy({
      module: data.module,
      action: data.action,
    });

    if (!permission) {
      permission = this.permissionRepo.create(data);
      await this.permissionRepo.save(permission);
    }

    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }
}
