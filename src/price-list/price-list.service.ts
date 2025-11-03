import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePLServiceDto } from './dtos/create-price-list.dto';
import { randomUUID } from 'crypto';

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
  async findOne(id: number) {
    const services = await this.prisma.$queryRaw<any[]>`
    SELECT p."PLServiceID",
           p."PLServName",
           p."DatePL",
           COUNT(DISTINCT ps."ServiceID") AS "NumberOfServices"
    FROM "tblPLServices" p
    JOIN "tblPLServicesDetail" ps ON p."PLServiceID" = ps."PLServiceID"
    WHERE p."PLServiceID"=${id}
    GROUP BY p."PLServiceID", p."PLServName", p."DatePL"
  `;

    if (!services.length) {
      throw new Error(`Price list with ID ${id} not found`);
    }

    return {
      ...services[0],
      NumberOfServices: Number(services[0].NumberOfServices),
    };
  }

  async create(dto: CreatePLServiceDto) {
    return this.prisma.tblPLServices.create({
      data: {
        PLServiceUUID: randomUUID(),
        PLServName: dto.PLServName,
        DatePL: new Date(dto.DatePL),
        ValidityFrom: new Date(dto.ValidityFrom),
        AuditUserID: 1,
        LocationId: dto.LocationId ?? null,
        LegacyID: dto.LegacyID ?? null,
      },
    });
  }
}
