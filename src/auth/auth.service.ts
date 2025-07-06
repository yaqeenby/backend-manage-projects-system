import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/role.entity';
import { Department } from '../departments/department.entity';
import { User } from '..//users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: any) {
    const payload = { 
      userId: user.id, 
      fullName: user.fullName,
      email: user.email, 
      phone: user.phone, 
      role: user.role,
      permissions: user.role.permissions.map((p) => `${p.module}.${p.action}`)
     };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  //   async register(dto: RegisterDto) {
  //   const existing = await this.userRepo.findOne({ where: { email: dto.email } });
  //   if (existing) {
  //     throw new Error('Email already exists');
  //   }

  //   const hashed = await bcrypt.hash(dto.password, 10);
  //   const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
  //   if (!role) throw new Error('Role not found');

  //   let department: Department | null = null;
  //   if (dto.departmentId) {
  //     department = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
  //     if (!department) throw new Error('Department not found');
  //   }

  //   const newUser = this.userRepo.create({
  //     fullName: dto.fullName,
  //     email: dto.email,
  //     phone: dto.phone,
  //     password: hashed,
  //     role,
  //     departments: department ?? undefined,
  //   });

  //   await this.userRepo.save(newUser);
  //   return { message: 'User registered successfully' };
  // }
}
