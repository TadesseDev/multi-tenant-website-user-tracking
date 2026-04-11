import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Campaign 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;
}
