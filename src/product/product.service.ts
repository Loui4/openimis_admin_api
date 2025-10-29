import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

}
