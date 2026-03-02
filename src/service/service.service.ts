import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

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
    return services.map((s) => ({
      ...s,
      ServiceID: Number(s.ServiceID),
      ServPrice: Number(s.ServPrice),
      MaximumAmount: s.MaximumAmount ? Number(s.MaximumAmount) : null,
    }));
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

  // ------------------------------
  // Dry Run CSV Import
  // ------------------------------
async analyzeCsv(csvContent: string, auditUserId: number = 1) {
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
async importCsv(csvContent: string, auditUserId: number) {
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
  if (codes.length > 0) {
    const existingServices = await this.prisma.$queryRawUnsafe<{ ServCode: string; ServiceID: number }[]>(`
      SELECT "ServiceID", "ServCode" FROM "tblServices" WHERE "ServCode" IN (${codes.map((c) => `'${c.replace(/'/g, "''")}'`).join(',')})
    `);
    existingCodes = existingServices.map((s) => s.ServCode);
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
      const name = (record.name || '').replace(/'/g, "''").substring(0, 100);
      const type = (record.type || 'C').replace(/'/g, "''").substring(0, 1);
      const level = (record.level || 'S').replace(/'/g, "''").substring(0, 1);
      const price = record.price || 0;
      const careType = (record.care_type || 'O').replace(/'/g, "''").substring(0, 1);
      
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
        // UPDATE
        await this.prisma.$executeRawUnsafe(`
          UPDATE "tblServices"
          SET 
            "ServName" = '${name}',
            "ServType" = '${type}',
            "ServLevel" = '${level}',
            "ServPrice" = ${price},
            "ServCareType" = '${careType}',
            "ServCategory" = ${category},
            "ServFrequency" = ${frequency},
            "AuditUserID" = ${auditUserId}
          WHERE "ServCode" = '${code}'
        `);
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
            ${price}, '${careType}', ${frequency}, 0, NOW(), 
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





