import { IsString, IsEmail, IsOptional, IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  departmentsIds?: string[];

  @IsUUID()
  roleId?: string;

  @IsUUID()
  organizationId?: string;
}
