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
 async createOrUpdate(data: {
  PLServiceID: number;
  services: {
    ServiceID: number;
    ValidityFrom: Date;
    ValidityTo?: Date | null;
  }[];
}) {
  const { PLServiceID, services } = data;

  // 1️⃣ Get current services for this PLServiceID
  const existingServices = await this.prisma.tblPLServicesDetail.findMany({
    where: { PLServiceID },
  });

  const existingIds = existingServices.map((s) => s.ServiceID);
  const newIds = services.map((s) => s.ServiceID);

  // 2️⃣ Determine which services to create (in new array but not in existing)
  const servicesToCreate = services.filter(
    (s) => !existingIds.includes(s.ServiceID)
  );

  // 3️⃣ Determine which services to delete (in existing but not in new array)
  const servicesToDelete = existingServices.filter(
    (s) => !newIds.includes(s.ServiceID)
  );

  // 4️⃣ Build Prisma transactions
  const transaction: any[] = [];

  // Create new services
  for (const service of servicesToCreate) {
    transaction.push(
      this.prisma.tblPLServicesDetail.create({
        data: {
          PLServiceID,
          ServiceID: service.ServiceID,
          ValidityFrom: service.ValidityFrom,
          ValidityTo: service.ValidityTo ?? null,
          AuditUserID: 1, // adjust if dynamic
        },
      })
    );
  }

  // Delete removed services
  for (const service of servicesToDelete) {
    transaction.push(
      this.prisma.tblPLServicesDetail.delete({
        where: { PLServiceDetailID: service.PLServiceDetailID },
      })
    );
  }

  // 5️⃣ Execute all in a single transaction
  return await this.prisma.$transaction(transaction);
}

}
