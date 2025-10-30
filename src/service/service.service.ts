import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

//   async findAll(filters: { servType?: string; servLevel?: string }) {
  async findAll() {
    // const { servType, servLevel } = filters;

    let query = `
      SELECT 
        s."ServiceID",
        s."ServiceUUID",
        s."ServCode",
        s."ServName",
        s."ServType",
        s."ServLevel",
        s."ServPrice",
        s."ServCareType",
        s."ServFrequency",
        s."ServPatCat",
        s."ValidityFrom",
        s."ValidityTo",
        s."AuditUserID",
        s."MaximumAmount",
        s."manualPrice",
        s."ServPackageType",
        s."ServCategory",
        s."LegacyID"
      FROM "tblServices" s
      WHERE s."ValidityTo" IS NULL
    `;

    // if (servType) query += ` AND s."ServType" = '${servType}'`;
    // if (servLevel) query += ` AND s."ServLevel" = '${servLevel}'`;

    const services = await this.prisma.$queryRawUnsafe<any[]>(query);

    return services.map((s) => ({
      ...s,
      ServiceID: Number(s.ServiceID),
      ServPrice: Number(s.ServPrice),
      MaximumAmount: s.MaximumAmount ? Number(s.MaximumAmount) : null,
    }));
  }

  async create(dto: CreateServiceDto) {
    const uuid = randomUUID();

    const result = await this.prisma.$executeRawUnsafe(`
      INSERT INTO "tblServices" 
        ("ServiceUUID", "ServCode", "ServName", "ServType", "ServLevel", "ServPrice",
         "ServCareType", "ServPatCat", "manualPrice", "ServPackageType", "ServCategory",
         "AuditUserID", "ValidityFrom", "MaximumAmount", "LegacyID")
      VALUES (
        '${uuid}', 
        '${dto.ServCode}', 
        '${dto.ServName}', 
        '${dto.ServType}', 
        '${dto.ServLevel}', 
        ${dto.ServPrice},
        '${dto.ServCareType}',
        ${dto.ServPatCat},
        ${dto.manualPrice},
        '${dto.ServPackageType}',
        ${dto.ServCategory ? `'${dto.ServCategory}'` : 'NULL'},
        ${dto.AuditUserID},
        '${dto.ValidityFrom}',
        ${dto.MaximumAmount ?? 'NULL'},
        ${dto.LegacyID ?? 'NULL'}
      )
    `);

    return {
      message: 'Service created successfully',
      ServiceUUID: uuid,
    };
  }
}
