import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';
import { PrismaService } from '../prisma/prisma.service';
import { IngestEventDto } from './dto/ingest-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private sqsService: SqsService,
    private configService: ConfigService,
  ) {}

  async ingestEvent(
    ingestEventDto: IngestEventDto,
  ): Promise<{ messageId: string }> {
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

    // Send the event to SQS for processing
    const queueName = this.configService.get<string>('aws.sqs.queueName') || 'event-ingestion';
    await this.sqsService.send(queueName, {
      id: ingestEventDto.event_id,
      body: {
        eventId: ingestEventDto.event_id,
        tenantId: ingestEventDto.tenant_id,
        campaignId: ingestEventDto.campaign_id,
        eventType: ingestEventDto.event_type,
        payload: ingestEventDto.payload,
      },
    });

    return { messageId: ingestEventDto.event_id };
  }
}
