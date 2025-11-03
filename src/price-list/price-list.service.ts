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
  const result = await this.prisma.$queryRaw<any[]>`
    SELECT 
      p."PLServiceID",
      p."PLServName",
      p."DatePL",
      COUNT(DISTINCT ps."ServiceID") AS "NumberOfServices",
      json_agg(
        json_build_object(
          'ServiceID', s."ServiceID",
          'ServiceCode', s."ServCode",
          'ServiceName', s."ServName",
          'PriceOverule', ps."PriceOverule"
        )
      ) AS "Services"
    FROM "tblPLServices" p
    JOIN "tblPLServicesDetail" ps ON p."PLServiceID" = ps."PLServiceID"
    JOIN "tblServices" s ON ps."ServiceID" = s."ServiceID"
    WHERE p."PLServiceID" = ${id}
    GROUP BY p."PLServiceID", p."PLServName", p."DatePL"
  `;
  
  if (!result.length) throw new Error(`Price list with ID ${id} not found`);

  const priceList = result[0];
  return {
    ...priceList,
    NumberOfServices: Number(priceList.NumberOfServices),
    Services: priceList.Services ?? [],
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
