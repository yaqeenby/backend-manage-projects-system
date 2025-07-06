// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

async createRole(name: string, permissions: Permission[]): Promise<Role> {
  let role = await this.roleRepo.findOne({ where: { name }, relations: ['permissions'] });
  
  if (!role) {
    role = this.roleRepo.create({ name, permissions });
  } else {
    role.permissions = permissions;
  }
  
  return this.roleRepo.save(role);
}

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }
}
