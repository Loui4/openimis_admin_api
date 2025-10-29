import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PriceListService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const services = await this.prisma.$queryRaw<any[]>`
      SELECT p."PLServiceID",
             p."PLServName",
             p."DatePL",
             COUNT(DISTINCT ps."ServiceID") AS "NumberOfServices"
      FROM "tblPLServices" p
      JOIN "tblPLServicesDetail" ps ON p."PLServiceID" = ps."PLServiceID"
      WHERE p."ValidityTo" IS NULL AND ps."ValidityTo" IS NULL
      GROUP BY p."PLServiceID", p."PLServName", p."DatePL"
    `;

    // Convert BigInt fields only
    return services.map((s) => ({
      ...s,
      NumberOfServices: Number(s.NumberOfServices),
    }));
  }
}
