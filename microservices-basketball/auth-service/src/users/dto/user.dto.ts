import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from '../../entities/user.entity';
import { RoleType } from '../../entities/role.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: RoleType, isArray: true, required: false })
  @IsOptional()
  @IsEnum(RoleType, { each: true })
  roles?: RoleType[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  roles: string[];

  @ApiProperty()
  createdAt: Date;
}
