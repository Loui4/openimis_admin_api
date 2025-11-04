import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM "core_TechnicalUser" ORDER BY "username"
    `);
  }

  async findOne(id: string) {
    const users = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "core_TechnicalUser" WHERE "id" = '${id}'
    `);
    if (!users.length) throw new NotFoundException('User not found');
    return users[0];
  }

  async create(dto: CreateUserDto) {
    const id = randomUUID();
    const query = `
      INSERT INTO "core_TechnicalUser" 
      ("id", "username", "password", "email", "is_staff", "is_superuser", "validity_from", "validity_to")
      VALUES (
        '${id}',
        '${dto.username.replace(/'/g, "''")}',
        '${dto.password.replace(/'/g, "''")}',
        ${dto.email ? `'${dto.email}'` : 'NULL'},
        ${dto.is_staff},
        ${dto.is_superuser},
        ${dto.validity_from ? `'${dto.validity_from}'` : 'NULL'},
        ${dto.validity_to ? `'${dto.validity_to}'` : 'NULL'}
      )
    `;
    await this.prisma.$executeRawUnsafe(query);
    return { message: 'User created successfully', id };
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);

    const query = `
      UPDATE "core_TechnicalUser"
      SET
        "username" = '${(dto.username ?? existing.username).replace(/'/g, "''")}',
        "password" = '${(dto.password ?? existing.password).replace(/'/g, "''")}',
        "email" = ${dto.email ? `'${dto.email}'` : existing.email ? `'${existing.email}'` : 'NULL'},
        "is_staff" = ${dto.is_staff ?? existing.is_staff},
        "is_superuser" = ${dto.is_superuser ?? existing.is_superuser},
        "validity_from" = ${dto.validity_from ? `'${dto.validity_from}'` : existing.validity_from ? `'${existing.validity_from}'` : 'NULL'},
        "validity_to" = ${dto.validity_to ? `'${dto.validity_to}'` : existing.validity_to ? `'${existing.validity_to}'` : 'NULL'}
      WHERE "id" = '${id}'
    `;
    await this.prisma.$executeRawUnsafe(query);
    return { message: 'User updated successfully' };
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.$executeRawUnsafe(`
      DELETE FROM "core_TechnicalUser" WHERE "id" = '${id}'
    `);
    return { message: 'User deleted successfully' };
  }
}
