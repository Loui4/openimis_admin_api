import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean, IsUUID, IsDateString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Unique username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'strongpassword123', description: 'User password (hashed preferred)' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_staff: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_superuser: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  validity_from?: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  validity_to?: string | null;
}
