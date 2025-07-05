// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/role.entity'
import { Department } from '../departments/department.entity';
import * as bcrypt from 'bcrypt';
import { UserValidatorService } from './user-validator.service';
import { Organization } from 'src/organizations/organization.entity';
import { AuthUser } from 'src/auth/types/auth-user.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly userValidator: UserValidatorService
  ) {}

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.userRepo.findOne({ where: { email }, relations: ['role', 'role.permissions', 'departments'] });
  }

  async findById(id: string): Promise<User | undefined | null> {
    return this.userRepo.findOne({ where: { id }, relations: ['role', 'role.permissions', 'departments'] });
  }

  async create(createUserDto: CreateUserDto, currentUser: AuthUser | null): Promise<User> {
    await this.userValidator.validate(createUserDto);
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepo.create({
      ...createUserDto,
      role: {id: createUserDto.roleId} as Role,
      departments: createUserDto.departmentsIds?.map(d => ({id: d} as Department)),
      organization: {id: createUserDto.organizationId} as Organization,
      createdBy: currentUser?.userId,
      updatedBy: currentUser?.userId
    });

    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async update(id: string, dto: UpdateUserDto, currentUser: AuthUser): Promise<User | undefined | null> {
    await this.userValidator.validate(dto);

    //prevent edit on data that affect the relations
    //depends on requirments 
    //we should check all relations before edit any relation id to keep data linked correctly
    
    dto.roleId = undefined;
    dto.departmentsIds = undefined;
    dto.organizationId = undefined;

    var data: any = dto;
    if(dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    // if(dto.roleId) {
    //   data = Object.assign(data, { role: {id: dto.roleId} as Role });
    // }
    
  //  if(dto.departmentsIds && dto.departmentsIds.length > 0) {
  //     data = Object.assign(data, { departments: dto.departmentsIds?.map(d => ({id: d} as Department)) });
  //  }
    
  //   if(dto.organizationId) {
  //     data = Object.assign(data, { organization: {id: dto.organizationId} as Organization });
  //   }
    
    data.updatedBy = currentUser.userId;
    await this.userRepo.update(id, data);

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
