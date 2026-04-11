import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IngestEventDto } from './dto/ingest-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('event-ingestion') private eventQueue: Queue,
  ) {}

  async ingestEvent(ingestEventDto: IngestEventDto): Promise<{ jobId: string }> {
    // Validate tenant and campaign exist
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: ingestEventDto.tenant_id },
    });

    if (!tenant) {
      throw new BadRequestException('Invalid tenant_id');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: ingestEventDto.campaign_id },
    });

    if (!campaign || campaign.tenantId !== ingestEventDto.tenant_id) {
      throw new BadRequestException('Invalid campaign_id for this tenant');
    }

    // Queue the event for processing
    const job = await this.eventQueue.add('process-event', {
      eventId: ingestEventDto.event_id,
      tenantId: ingestEventDto.tenant_id,
      campaignId: ingestEventDto.campaign_id,
      eventType: ingestEventDto.event_type,
      payload: ingestEventDto.payload,
    });

    return { jobId: job.id || '' };
  }
}
