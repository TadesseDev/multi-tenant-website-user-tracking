import { ApiProperty } from '@nestjs/swagger';

export class DailyAggregationDto {
  @ApiProperty({ example: '2026-04-11' })
  date: string;

  @ApiProperty({ example: 'page_view' })
  eventType: string;

  @ApiProperty({ example: 42 })
  count: number;
}
