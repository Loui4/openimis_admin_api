import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { randomUUID } from 'crypto';
import * as csv from 'csv-parse/sync';

interface CsvServiceItem {
  code: string;
  name: string;
  type: string;
  level: string;
  price: number|string;
  category?: string;
  care_type: string;
  frequency?: number | string;
  male_cat?: number;
  female_cat?: number;
  adult_cat?: number;
  minor_cat?: number;
}

type ServiceExportRow = {
  ServCode: string;
  ServName: string;
  ServType: string;
  ServLevel: string;
  ServPrice: unknown;
  ServCategory?: string | null;
  ServCareType: string;
  ServFrequency?: number | null;
  ServPatCat?: number | null;
};

type ServiceVersionUpdate = {
  ServName?: string;
};

const SERVICE_EXPORT_HEADERS = [
  'code',
  'name',
  'type',
  'level',
  'price',
  'category',
  'care_type',
  'frequency',
  'male_cat',
  'female_cat',
  'adult_cat',
  'minor_cat',
];

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  private toListServiceDto(s: any) {
    return {
      ...s,
      ServiceID: Number(s.ServiceID),
      ServPrice: Number(s.ServPrice),
      MaximumAmount: s.MaximumAmount ? Number(s.MaximumAmount) : null,
    };
  }

  private toValidityFromDate(validityFrom?: string) {
    if (!validityFrom?.trim()) {
      return new Date();
    }

    const parsedDate = new Date(validityFrom);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid ValidityFrom value: '${validityFrom}'`);
    }

    return parsedDate;
  }

  private formatCsvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);

    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  private formatCsvNumber(value: unknown) {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const text = String(value);

    if (!/^-?\d+(\.\d+)?$/.test(text)) {
      return text;
    }

    return text.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  }

  private toPatientCategoryFlags(value: unknown) {
    const category = Number(value);

    if (!Number.isFinite(category) || category === 0) {
      return {
        male_cat: 1,
        female_cat: 1,
        adult_cat: 1,
        minor_cat: 1,
      };
    }

    return {
      male_cat: category & 1 ? 1 : 0,
      female_cat: category & 2 ? 1 : 0,
      adult_cat: category & 4 ? 1 : 0,
      minor_cat: category & 8 ? 1 : 0,
    };
  }

  private toPatientCategoryValue(record: CsvServiceItem) {
    const flags = [
      Number(record.male_cat) === 1 ? 1 : 0,
      Number(record.female_cat) === 1 ? 2 : 0,
      Number(record.adult_cat) === 1 ? 4 : 0,
      Number(record.minor_cat) === 1 ? 8 : 0,
    ];

    const value = flags.reduce((sum, flag) => sum + flag, 0);

    return value === 0 ? 15 : value;
  }

  // ------------------------------
  // List all active services
  // ------------------------------
  async findAll() {
    const query = `
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

    const services = await this.prisma.$queryRawUnsafe<any[]>(query);
    return services.map((s) => this.toListServiceDto(s));
  }

  async exportCsv() {
    const services = await this.prisma.$queryRaw<ServiceExportRow[]>`
      SELECT
        s."ServCode",
        s."ServName",
        s."ServType",
        s."ServLevel",
        s."ServPrice",
        s."ServCategory",
        s."ServCareType",
        s."ServFrequency",
        s."ServPatCat"
      FROM "tblServices" s
      WHERE s."ValidityTo" IS NULL
      ORDER BY s."ServiceID" ASC
    `;

    const rows = services.map((service) => {
      const patientCategoryFlags = this.toPatientCategoryFlags(service.ServPatCat);

      return [
        service.ServCode,
        service.ServName,
        service.ServType,
        service.ServLevel,
        this.formatCsvNumber(service.ServPrice),
        service.ServCategory,
        service.ServCareType,
        service.ServFrequency,
        patientCategoryFlags.male_cat,
        patientCategoryFlags.female_cat,
        patientCategoryFlags.adult_cat,
        patientCategoryFlags.minor_cat,
      ]
        .map((value) => this.formatCsvCell(value))
        .join(',');
    });

    return [SERVICE_EXPORT_HEADERS.join(','), ...rows].join('\r\n') + '\r\n';
  }

  async findOne(id: number) {
    const services = await this.prisma.$queryRaw<any[]>`
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
      WHERE s."ValidityTo" IS NULL AND s."ServiceID" = ${id}
      LIMIT 1
    `;

    const service = services[0];

    if (!service) {
      throw new NotFoundException(`Active service with ID ${id} not found`);
    }

    return this.toListServiceDto(service);
  }

  // ------------------------------
  // Create a single service
  // ------------------------------
  async create(dto: CreateServiceDto) {
    const uuid = randomUUID();

    await this.prisma.$executeRaw`
      INSERT INTO "tblServices"
        ("ServiceUUID", "ServCode", "ServName", "ServType", "ServLevel", "ServPrice",
         "ServCareType", "ServFrequency", "ServPatCat", "manualPrice", "ServPackageType",
         "ServCategory", "AuditUserID", "ValidityFrom", "MaximumAmount", "LegacyID")
      VALUES (
        ${uuid},
        ${dto.ServCode},
        ${dto.ServName},
        ${dto.ServType},
        ${dto.ServLevel},
        ${dto.ServPrice},
        ${dto.ServCareType},
        ${dto.ServFrequency ?? null},
        ${dto.ServPatCat},
        ${dto.manualPrice},
        ${dto.ServPackageType},
        ${dto.ServCategory ?? null},
        ${dto.AuditUserID},
        ${new Date(dto.ValidityFrom)},
        ${dto.MaximumAmount ?? null},
        ${dto.LegacyID ?? null}
      )
    `;

    return {
      message: 'Service created successfully',
      ServiceUUID: uuid,
    };
  }

  async update(id: number, dto: CreateServiceDto) {
    const updated = await this.prisma.$queryRaw<any[]>`
      UPDATE "tblServices"
      SET
        "ServCode" = ${dto.ServCode},
        "ServName" = ${dto.ServName},
        "ServType" = ${dto.ServType},
        "ServLevel" = ${dto.ServLevel},
        "ServPrice" = ${dto.ServPrice},
        "ServCareType" = ${dto.ServCareType},
        "ServFrequency" = ${dto.ServFrequency ?? null},
        "ServPatCat" = ${dto.ServPatCat},
        "manualPrice" = ${dto.manualPrice},
        "ServPackageType" = ${dto.ServPackageType},
        "ServCategory" = ${dto.ServCategory ?? null},
        "AuditUserID" = ${dto.AuditUserID},
        "ValidityFrom" = ${new Date(dto.ValidityFrom)},
        "MaximumAmount" = ${dto.MaximumAmount ?? null},
        "LegacyID" = ${dto.LegacyID ?? null}
      WHERE "ServiceID" = ${id} AND "ValidityTo" IS NULL
      RETURNING
        "ServiceID",
        "ServiceUUID",
        "ServCode",
        "ServName",
        "ServType",
        "ServLevel",
        "ServPrice",
        "ServCareType",
        "ServFrequency",
        "ServPatCat",
        "ValidityFrom",
        "ValidityTo",
        "AuditUserID",
        "MaximumAmount",
        "manualPrice",
        "ServPackageType",
        "ServCategory",
        "LegacyID"
    `;

    const service = updated[0];

    if (!service) {
      throw new NotFoundException(`Active service with ID ${id} not found`);
    }

    return this.toListServiceDto(service);
  }

  async updatePrice(
    id: number,
    price: number,
    auditUserId?: number,
    validityFrom?: Date,
    updates: ServiceVersionUpdate = {},
  ) {
    const now = validityFrom ?? new Date();
    const uuid = randomUUID();

    const service = await this.prisma.$transaction(async (tx) => {
      const expired = await tx.$queryRaw<any[]>`
        UPDATE "tblServices"
        SET "ValidityTo" = ${now}
        WHERE "ServiceID" = ${id} AND "ValidityTo" IS NULL
        RETURNING
          "ServiceID",
          "ServCode",
          "ServName",
          "ServType",
          "ServLevel",
          "ServCareType",
          "ServFrequency",
          "ServPatCat",
          "AuditUserID",
          "MaximumAmount",
          "manualPrice",
          "ServPackageType",
          "ServCategory"
      `;

      const previousService = expired[0];

      if (!previousService) {
        throw new NotFoundException(`Active service with ID ${id} not found`);
      }

      const inserted = await tx.$queryRaw<any[]>`
        INSERT INTO "tblServices"
          ("ServiceUUID", "LegacyID", "ServCategory", "ServCode", "ServName",
           "ServType", "ServLevel", "ServPrice", "ServCareType", "ServFrequency",
           "ServPatCat", "ValidityFrom", "ValidityTo", "AuditUserID",
           "MaximumAmount", "manualPrice", "ServPackageType")
        VALUES (
          ${uuid},
          ${previousService.ServiceID},
          ${previousService.ServCategory},
          ${previousService.ServCode},
          ${updates.ServName?.trim()
            ? updates.ServName.trim().substring(0, 100)
            : previousService.ServName},
          ${previousService.ServType},
          ${previousService.ServLevel},
          ${price},
          ${previousService.ServCareType},
          ${previousService.ServFrequency},
          ${previousService.ServPatCat},
          ${now},
          ${null},
          ${auditUserId ?? previousService.AuditUserID},
          ${previousService.MaximumAmount},
          ${previousService.manualPrice},
          ${previousService.ServPackageType}
        )
        RETURNING
          "ServiceID",
          "ServiceUUID",
          "ServCode",
          "ServName",
          "ServType",
          "ServLevel",
          "ServPrice",
          "ServCareType",
          "ServFrequency",
          "ServPatCat",
          "ValidityFrom",
          "ValidityTo",
          "AuditUserID",
          "MaximumAmount",
          "manualPrice",
          "ServPackageType",
          "ServCategory",
          "LegacyID"
      `;

      return inserted[0];
    });

    return this.toListServiceDto(service);
  }

  // ------------------------------
  // Dry Run CSV Import
  // ------------------------------
async analyzeCsv(csvContent: string, auditUserId: number = 1, validityFrom?: string) {
  this.toValidityFromDate(validityFrom);

  let records: CsvServiceItem[] = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });



  console.log('📊 Total records parsed (after filtering empty):', records.length);
  console.log('📋 Records:', records);

  // return;

  if (records.length === 0) {
    return { 
      inserted: 0, 
      updated: 0, 
      skipped: 0,
      errorCount: 0,
      errors: [] 
    };
  }

  const validRecords = records.filter(r => r.code && r.code.trim() !== '');
  const skippedCount = records.length - validRecords.length;
  
  console.log('✅ Valid records (with code):', validRecords.length);
  console.log('⚠️  Skipped records (no code):', skippedCount);

  if (validRecords.length === 0) {
    return {
      inserted: 0,
      updated: 0,
      skipped: records.length,
      errorCount: 1,
      errors: [{
        code: 'N/A',
        friendlyMessage: 'No valid records',
        detailedError: 'No valid records found. ServCode is required for all records.'
      }]
    };
  }

  const codes = validRecords.map((r) => r.code.trim());
  
  let existingCodes: string[] = [];
  if (codes.length > 0) {
    const existingServices = await this.prisma.$queryRawUnsafe<{ ServCode: string }[]>(`
      SELECT "ServCode" FROM "tblServices" WHERE "ServCode" IN (${codes.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')})
    `);
    existingCodes = existingServices.map((s) => s.ServCode);
    console.log('🔍 Existing codes found:', existingCodes.length, existingCodes);
  }

  let wouldInsert = 0;
  let wouldUpdate = 0;
  const errors: Array<{
    code: string;
    friendlyMessage: string;
    detailedError: string;
  }> = [];

  const getFriendlyError = (errorType: string, details?: string): string => {
    switch (errorType) {
      case 'MISSING_FIELD':
        return 'Missing required field';
      case 'TOO_LONG':
        return 'Value too long for field';
      case 'INVALID_TYPE':
        return 'Invalid data type';
      case 'DUPLICATE':
        return 'Duplicate record';
      default:
        return 'Validation error';
    }
  };

  const validateRecord = (record: CsvServiceItem): { valid: boolean; errorType?: string; errorDetail?: string } => {
    // Check required fields
    if (!record.code || record.code.trim() === '') {
      return { valid: false, errorType: 'MISSING_FIELD', errorDetail: 'ServCode is required' };
    }

    if (!record.name || record.name.trim() === '') {
      return { valid: false, errorType: 'MISSING_FIELD', errorDetail: 'ServName is required' };
    }

    // Check field lengths
    if (record.code.trim().length > 6) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServCode exceeds 6 characters: '${record.code}'` };
    }

    if (record.name.length > 100) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServName exceeds 100 characters: '${record.name.substring(0, 50)}...'` };
    }

    // Validate price - convert to string for checking
    const priceStr = String(record.price || '').trim();
    if (priceStr && priceStr !== '') {
      const priceNum = Number(priceStr);
      if (isNaN(priceNum)) {
        return { valid: false, errorType: 'INVALID_TYPE', errorDetail: `ServPrice must be a number, received: '${priceStr}'` };
      }
    }

    // Validate frequency - convert to string for checking
    const freqStr = String(record.frequency || '').trim();
    if (freqStr && freqStr !== '') {
      const freqNum = Number(freqStr);
      if (isNaN(freqNum)) {
        return { valid: false, errorType: 'INVALID_TYPE', errorDetail: `ServFrequency must be a number, received: '${freqStr}'` };
      }
      if (!Number.isInteger(freqNum)) {
        return { valid: false, errorType: 'INVALID_TYPE', errorDetail: `ServFrequency must be an integer, received: '${freqStr}'` };
      }
      if (freqNum < -32768 || freqNum > 32767) {
        return { valid: false, errorType: 'INVALID_TYPE', errorDetail: `ServFrequency must be between -32768 and 32767, received: ${freqNum}` };
      }
    }

    // Check single character fields
    if (record.type && record.type.trim() && record.type.length > 1) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServType must be 1 character, received: '${record.type}'` };
    }

    if (record.level && record.level.trim() && record.level.length > 1) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServLevel must be 1 character, received: '${record.level}'` };
    }

    if (record.care_type && record.care_type.trim() && record.care_type.length > 1) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServCareType must be 1 character, received: '${record.care_type}'` };
    }

    if (record.category && record.category.trim() && record.category.trim().length > 1) {
      return { valid: false, errorType: 'TOO_LONG', errorDetail: `ServCategory must be 1 character, received: '${record.category}'` };
    }

    return { valid: true };
  };

  for (const record of validRecords) {
    const validation = validateRecord(record);
    
    if (!validation.valid) {
      errors.push({
        code: record.code || 'UNKNOWN',
        friendlyMessage: getFriendlyError(validation.errorType!, validation.errorDetail),
        detailedError: validation.errorDetail || 'Validation failed',
      });
      continue;
    }

    const trimmedCode = record.code.trim();
    const isExisting = existingCodes.includes(trimmedCode);
    
    console.log(`🔎 Code: ${trimmedCode} - ${isExisting ? 'UPDATE' : 'INSERT'}`);
    
    if (isExisting) {
      wouldUpdate++;
    } else {
      wouldInsert++;
    }
  }

  console.log(`📈 Summary: ${wouldInsert} insert, ${wouldUpdate} update, ${skippedCount} skipped, ${errors.length} errors`);

  return { 
    inserted: wouldInsert,
    updated: wouldUpdate,
    skipped: skippedCount,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

  // ------------------------------
  // Actual Import (Insert or Update)
  // ------------------------------
async importCsv(csvContent: string, auditUserId: number, validityFrom?: string) {
  const validityFromDate = this.toValidityFromDate(validityFrom);

  const records: CsvServiceItem[] = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (records.length === 0) {
    return { inserted: 0, updated: 0, errors: [] };
  }

  const validRecords = records.filter(r => r.code && r.code.trim() !== '');
  
  if (validRecords.length === 0) {
    throw new Error('No valid records found. ServCode is required for all records.');
  }

  const codes = validRecords.map((r) => r.code.trim());
  
  let existingCodes: string[] = [];
  const existingServicesByCode = new Map<string, { ServiceID: number }>();
  if (codes.length > 0) {
    const existingServices = await this.prisma.$queryRawUnsafe<{ ServCode: string; ServiceID: number }[]>(`
      SELECT "ServiceID", "ServCode" FROM "tblServices" WHERE "ValidityTo" IS NULL AND "ServCode" IN (${codes.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')})
    `);
    existingCodes = existingServices.map((s) => s.ServCode);
    existingServices.forEach((service) => {
      existingServicesByCode.set(service.ServCode, {
        ServiceID: Number(service.ServiceID),
      });
    });
  }

  let inserted = 0;
  let updated = 0;
  const errors: Array<{
    code: string;
    friendlyMessage: string;
    detailedError: string;
  }> = [];

  // Helper function to create friendly error messages
  const getFriendlyError = (errorMessage: string): string => {
    if (errorMessage.includes('23502')) {
      return 'Missing required field';
    } else if (errorMessage.includes('22001')) {
      return 'Value too long for field';
    } else if (errorMessage.includes('42601')) {
      return 'Invalid SQL syntax';
    } else if (errorMessage.includes('23505')) {
      return 'Duplicate record';
    } else if (errorMessage.includes('22P02')) {
      return 'Invalid data type';
    } else {
      return 'Database error';
    }
  };

  for (const record of validRecords) {
    try {
      const code = record.code.trim().replace(/'/g, "''").substring(0, 6);
      const importedName = (record.name || '').substring(0, 100);
      const name = importedName.replace(/'/g, "''");
      const type = (record.type || 'C').replace(/'/g, "''").substring(0, 1);
      const level = (record.level || 'S').replace(/'/g, "''").substring(0, 1);
      const price = record.price || 0;
      const careType = (record.care_type || 'O').replace(/'/g, "''").substring(0, 1);
      const patientCategory = this.toPatientCategoryValue(record);
      
      // Handle category - can be NULL
      let category = 'NULL';
      if (record.category && record.category.trim()) {
        category = `'${record.category.trim().replace(/'/g, "''").substring(0, 1)}'`;
      }
      
      // Handle frequency - must be integer or NULL
      let frequency = 'NULL';
      if (record.frequency && !isNaN(record.frequency as number)) {
        frequency = record.frequency.toString();
      }

      if (existingCodes.includes(record.code.trim())) {
        const activeService = existingServicesByCode.get(record.code.trim());

        if (!activeService) {
          throw new Error(`Active service with code '${record.code}' not found`);
        }

        await this.updatePrice(activeService.ServiceID, Number(price), auditUserId, validityFromDate, {
          ServName: importedName,
        });
        updated++;
      } else {
        // INSERT
        const uuid = randomUUID();
        
        const insertQuery = `
          INSERT INTO "tblServices" (
            "ServiceUUID", "ServCategory", "ServCode", "ServName", "ServType", "ServLevel", 
            "ServPrice", "ServCareType", "ServFrequency", "ServPatCat", "ValidityFrom", 
            "AuditUserID", "manualPrice", "ServPackageType"
          ) VALUES (
            '${uuid}', ${category}, '${code}', '${name}', '${type}', '${level}', 
            ${price}, '${careType}', ${frequency}, ${patientCategory}, '${validityFromDate.toISOString()}', 
            ${auditUserId}, false, 'C'
          )
        `.replace(/\s+/g, ' ').trim();
        
        await this.prisma.$executeRawUnsafe(insertQuery);
        inserted++;
      }
    } catch (error) {
      errors.push({
        code: record.code,
        friendlyMessage: getFriendlyError(error.message),
        detailedError: error.message,
      });
      
      console.error(`❌ Error processing code '${record.code}':`, error.message);
    }
  }

  return { 
    inserted, 
    updated, 
    skipped: records.length - validRecords.length,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

}
