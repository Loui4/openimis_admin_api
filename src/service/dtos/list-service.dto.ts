import { ApiProperty } from '@nestjs/swagger';

export class ListServiceDto {
  @ApiProperty({ example: 1, description: 'Unique service ID' })
  ServiceID: number;

  @ApiProperty({ example: '0e4d4e0b-8a22-4f6e-a3a9-5b8d6bb34e01', description: 'Unique service UUID' })
  ServiceUUID: string;

  @ApiProperty({ example: 'SRV-001', description: 'Service code' })
  ServCode: string;

  @ApiProperty({ example: 'General Consultation', description: 'Service name' })
  ServName: string;

  @ApiProperty({ example: 'O', description: 'Service type (O=Outpatient, I=Inpatient)' })
  ServType: string;

  @ApiProperty({ example: '1', description: 'Service level identifier' })
  ServLevel: string;

  @ApiProperty({ example: 2500.0, description: 'Service price (in MWK)' })
  ServPrice: number;

  @ApiProperty({ example: 'O', description: 'Care type (Outpatient/Inpatient)' })
  ServCareType: string;

  @ApiProperty({ example: 1, description: 'Service frequency', required: false })
  ServFrequency?: number;

  @ApiProperty({ example: 1, description: 'Patient category ID' })
  ServPatCat: number;

  @ApiProperty({ example: '2024-08-01T00:00:00.000Z', description: 'Validity start date' })
  ValidityFrom: string;

  @ApiProperty({ example: null, description: 'Validity end date (null if still active)', required: false })
  ValidityTo?: string | null;

  @ApiProperty({ example: 1, description: 'User who created or last updated the record' })
  AuditUserID: number;

  @ApiProperty({ example: 5000.0, description: 'Maximum allowable amount', required: false })
  MaximumAmount?: number;

  @ApiProperty({ example: true, description: 'Whether the price is manually entered' })
  manualPrice: boolean;

  @ApiProperty({ example: 'S', description: 'Service package type' })
  ServPackageType: string;

  @ApiProperty({ example: 'A', description: 'Service category (if applicable)', required: false })
  ServCategory?: string;

  @ApiProperty({ example: 123, description: 'Legacy system ID', required: false })
  LegacyID?: number;
}
