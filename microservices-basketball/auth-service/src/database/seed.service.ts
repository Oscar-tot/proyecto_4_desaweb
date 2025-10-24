import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const rolesData = [
      {
        name: RoleType.ADMIN,
        description: 'Administrador con acceso total al sistema',
      },
      {
        name: RoleType.USER,
        description: 'Usuario estándar del sistema',
      },
      {
        name: RoleType.MODERATOR,
        description: 'Moderador de contenido y partidos',
      },
      {
        name: RoleType.SCORER,
        description: 'Anotador autorizado para registrar eventos en partidos',
      },
    ];

    for (const roleData of rolesData) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`✅ Rol creado: ${roleData.name}`);
      } else {
        console.log(`⏭️  Rol ya existe: ${roleData.name}`);
      }
    }

    console.log('🎉 Seed de roles completado');
  }
}
