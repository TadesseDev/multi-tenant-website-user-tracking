import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { IngestEventDto } from './dto/ingest-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Ingest an event',
    description:
      'Public endpoint for ingesting website events. Events are queued for async processing.',
  })
  @ApiResponse({
    status: 202,
    description: 'Event accepted and queued for processing',
    schema: { example: { jobId: 'job-123' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid event data or invalid tenant/campaign',
  })
  async ingestEvent(
    @Body() ingestEventDto: IngestEventDto,
  ): Promise<{ jobId: string }> {
    const result = await this.eventsService.ingestEvent(ingestEventDto);
    return { jobId: result.messageId };
  }
}
