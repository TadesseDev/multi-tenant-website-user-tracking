import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @ApiProperty({
    example: '2026-04-01',
    description: 'Start date for aggregation (ISO format)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-04-30',
    description: 'End date for aggregation (ISO format)',
  })
  @IsDateString()
  endDate: string;
}
