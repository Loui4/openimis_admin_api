import { Injectable } from '@nestjs/common';
import { pbkdf2Sync, timingSafeEqual } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private verifyPassword(password: string, djangoHash: string): boolean {
    const [algorithm, iterationsStr, salt, hash] = djangoHash.split('$');
    if (algorithm !== 'pbkdf2_sha256') return false;

    const iterations = parseInt(iterationsStr, 10);
    const keylen = 32; // 256 bits
    const digest = 'sha256';

    const computedHash = pbkdf2Sync(password, salt, iterations, keylen, digest);
    const hashBuffer = Buffer.from(hash, 'base64');

    return timingSafeEqual(computedHash, hashBuffer);
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.core_TechnicalUser.findUnique({ where: { username } });
    if (!user) return null;

    const isValid = this.verifyPassword(password, user.password);
    if (!isValid) return null;

    // You can return user info excluding password
    const { password: _, ...result } = user;
    return result;
  }
}
