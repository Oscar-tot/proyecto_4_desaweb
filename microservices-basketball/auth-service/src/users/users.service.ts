import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role, RoleType } from '../entities/role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({ relations: ['roles'] });
    return users.map(user => this.sanitizeUser(user));
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async create(createUserDto: CreateUserDto) {
    // Hash password
    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '10'), 10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Obtener roles
    let roles: Role[] = [];
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      roles = await this.roleRepository.find({
        where: createUserDto.roles.map(roleName => ({ name: roleName })),
      });
    } else {
      // Rol USER por defecto
      const userRole = await this.roleRepository.findOne({
        where: { name: RoleType.USER },
      });
      if (userRole) {
        roles = [userRole];
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    await this.userRepository.save(user);
    return this.sanitizeUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Si se actualiza la contraseña
    if (updateUserDto.password) {
      const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS', '10'), 10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Guardar los roles actuales antes de hacer Object.assign
    const rolesActuales = user.roles;

    // Si se actualizan los roles
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      const roles = await this.roleRepository.find({
        where: updateUserDto.roles.map(roleName => ({ name: roleName })),
      });
      user.roles = roles;
    } else {
      // Si no se envían roles en el update, preservar los roles actuales
      user.roles = rolesActuales;
    }

    // Crear un objeto sin la propiedad roles para evitar sobrescribirlos
    const { roles, ...updateDataWithoutRoles } = updateUserDto;

    // Actualizar solo los campos enviados (sin roles)
    Object.assign(user, updateDataWithoutRoles);

    await this.userRepository.save(user);

    return this.sanitizeUser(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return {
      ...sanitized,
      roles: user.roles ? user.roles.map(role => role.name) : [],
    };
  }
}
