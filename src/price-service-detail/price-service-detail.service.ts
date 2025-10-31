import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PriceServiceDetailService {
  constructor(private prisma: PrismaService) {}
  async findAll(priceListId: number) {
    const details = await this.prisma.$queryRaw<any[]>`
      SELECT pd."ServiceID",
             s."ServCode",
             s."ServName",
             s."ServType",
             s."ServPrice"
      FROM "tblPLServicesDetail" pd
      JOIN "tblServices" s ON pd."ServiceID" = s."ServiceID"
      WHERE pd."ValidityTo" IS NULL AND s."ValidityTo" IS NULL AND pd."PLServiceID" = ${priceListId}
    `;

    // Convert BigInt fields if necessary (here ServiceID & ServPrice assumed as numbers)
    return details.map((d) => ({
      ...d,
      ServiceID: Number(d.ServiceID),
      ServPrice: Number(d.ServPrice),
    }));
  }
   // 🟢 Create multiple service details for a given PLServiceID
  async create(data: {
    PLServiceID: number;
    services: {
      ServiceID: number;
      ValidityFrom: Date;
      ValidityTo?: Date|null;
    }[];
  
  }) {
    const { PLServiceID, services } = data;

    // Build insert queries
    const insertPromises = services.map((service) =>
      this.prisma.tblPLServicesDetail.create({
        data: {
          PLServiceID,
          ServiceID: service.ServiceID,
          ValidityFrom: service.ValidityFrom,
          ValidityTo: service.ValidityTo || null,
          AuditUserID:1
        },
      }),
    );

    // Run all inserts in parallel
    return await this.prisma.$transaction(insertPromises);
  }
}
