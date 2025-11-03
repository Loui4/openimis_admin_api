import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'supersecret', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
