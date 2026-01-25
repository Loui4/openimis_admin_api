import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePLServiceDto } from './dtos/create-price-list.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PriceListService {
  constructor(private prisma: PrismaService) {}

 async findAll() {
  const services = await this.prisma.$queryRaw<
    Array<{
      PLServiceID: number;
      PLServName: string;
      DatePL: Date | null;
      NumberOfServices: bigint | number;
    }>
  >`
    SELECT
      p."PLServiceID",
      p."PLServName",
      p."DatePL",
      COALESCE(COUNT(DISTINCT ps."ServiceID"), 0) AS "NumberOfServices"
    FROM "tblPLServices" p
    LEFT JOIN "tblPLServicesDetail" ps
      ON p."PLServiceID" = ps."PLServiceID"
    WHERE p."ValidityTo" IS NULL
    GROUP BY p."PLServiceID", p."PLServName", p."DatePL"
    ORDER BY p."DatePL" DESC NULLS LAST, p."PLServiceID" DESC
  `;

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
          'PriceOverule', ps."PriceOverule", 
          'ServPrice', s."ServPrice",
          'ServType', s."ServType"
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
      DatePL: dto.DatePL ? new Date(dto.DatePL) : new Date(),
      ValidityFrom: dto.ValidityFrom ? new Date(dto.ValidityFrom) : new Date(),
      AuditUserID: 1,
      LocationId: dto.LocationId ?? null,
      LegacyID: dto.LegacyID ?? null,
    },
  });
}
}
