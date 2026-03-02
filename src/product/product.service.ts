import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dtos/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
  const products = await this.prisma.$queryRaw<any[]>`
    SELECT p."ProductCode",
           p."ProductName",
           r."LocationName" AS "Region",
           d."LocationName" AS "District",
           COUNT(DISTINCT ps."ServiceID") AS "NumberOfServices",
           p."MemberCount"
    FROM "tblProduct" p
    LEFT JOIN "tblProductServices" ps ON p."ProdID" = ps."ProdID"
    LEFT JOIN "tblLocations" d ON p."LocationId" = d."LocationId"
    LEFT JOIN "tblLocations" r ON d."ParentLocationId" = r."LocationId" AND r."LocationType" = 'R'
    WHERE p."ValidityTo" IS NULL
    GROUP BY p."ProductCode", p."ProductName", r."LocationName", d."LocationName", p."MemberCount"
  `;

  // Convert BigInt fields to number or string
  return products.map((p: any) => ({
    ...p,
    NumberOfServices: Number(p.NumberOfServices), 
    MemberCount: p.MemberCount !== null ? Number(p.MemberCount) : null,
  }));
}
 async create(dto: CreateProductDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO "tblProduct" (
        "ValidityFrom",
        "ProdUUID",
        "ProductCode",
        "ProductName",
        "DateFrom",
        "DateTo",
        "LumpSum",
        "MemberCount",
        "GracePeriod",
        "AuditUserID",
        "InsurancePeriod",
        "LocationId"
      )
      VALUES (
        NOW(),
        ${randomUUID()},
        ${dto.productCode},
        ${dto.productName},
        ${dto.dateFrom},
        ${dto.dateTo},
        ${dto.lumpSum},
        ${dto.memberCount},
        ${dto.gracePeriod},
        ${dto.auditUserId},
        ${dto.insurancePeriod},
        ${dto.locationId ?? null}
      )
      RETURNING 
        "ProdID",
        "ProductCode",
        "ProductName",
        "MemberCount"
    `;

    return result[0];
  }

}
