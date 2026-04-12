import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IngestEventDto {
  @ApiProperty({ example: 'evt_001_acme_summer' })
  @IsString()
  @IsNotEmpty()
  event_id: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '7a4ae9b7-5a12-4fae-98dc-e226ac78bbee',
  })
  @IsUUID()
  tenant_id: string;

  @ApiProperty({
    description: 'Campaign ID',
    example: '59c39a3d-4f3c-4d45-b525-ad580453c4cf',
  })
  @IsUUID()
  campaign_id: string;

  @ApiProperty({ example: 'page_view' })
  @IsString()
  @IsNotEmpty()
  event_type: string;

  @ApiProperty({
    example: { page: '/summer-sale', user_id: 'user_123' },
    description: 'Event payload as JSON object',
  })
  @IsNotEmpty()
  payload: Record<string, any>;
}
