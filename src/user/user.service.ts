import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

   /**
   * Generate a PBKDF2 SHA256 hash compatible with OpenIMIS
   */
  private hashPassword(password: string, salt?: string) {
    const iterations = 600000;
    const keylen = 32; // 32 bytes = 256 bits
    const digest = 'sha256';

    // generate random salt if not provided
    const saltToUse = salt ?? randomBytes(12).toString('base64');

    const hash = pbkdf2Sync(password, saltToUse, iterations, keylen, digest).toString('base64');

    return `pbkdf2_sha256$${iterations}$${saltToUse}$${hash}`;
  }

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
    const passwordHash = this.hashPassword(dto.password);

    const user = await this.prisma.core_TechnicalUser.create({
      data: {
        id: randomUUID(),
        username: dto.username,
        email: dto.email,
        password: passwordHash,
        is_staff: dto.isStaff ?? false,
        is_superuser: dto.isSuperuser ?? false,
        validity_from: dto.validityFrom ?? new Date(),
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);

    const query = `
      UPDATE "core_TechnicalUser"
      SET
        "username" = '${(dto.username ?? existing.username).replace(/'/g, "''")}',
        "password" = '${(dto.password ?? existing.password).replace(/'/g, "''")}',
        "email" = ${dto.email ? `'${dto.email}'` : existing.email ? `'${existing.email}'` : 'NULL'},
        "is_staff" = ${dto.isStaff ?? existing.is_staff},
        "is_superuser" = ${dto.isSuperuser ?? existing.is_superuser},
        "validity_from" = ${dto.validityFrom ? `'${dto.validityFrom}'` : existing.validity_from ? `'${existing.validity_from}'` : 'NULL'},
        "validity_to" = ${dto.validityTo ? `'${dto.validityTo}'` : existing.validity_to ? `'${existing.validity_to}'` : 'NULL'}
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

  verifyPassword(password: string, hashed: string) {
    const parts = hashed.split('$');
    if (parts.length !== 4) return false;

    const [algorithm, iterationsStr, salt, hash] = parts;
    const iterations = parseInt(iterationsStr, 10);
    const keylen = 32;

    const verifyHash = pbkdf2Sync(password, salt, iterations, keylen, 'sha256').toString('base64');

    return hash === verifyHash;
  }

  async findByUsername(username:string){
    return await this.prisma.core_TechnicalUser.findUnique({
      where: { username: username },
    });

  }
}
