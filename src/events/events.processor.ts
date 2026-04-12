import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('event-ingestion')
export class EventsProcessor extends WorkerHost {
  private readonly logger = new Logger(EventsProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { eventId, tenantId, campaignId, eventType, payload } = job.data as {
      eventId: string;
      tenantId: string;
      campaignId: string;
      eventType: string;
      payload: string;
    };

    try {
      // Attempt to create the event - will fail on duplicate due to unique constraint
      await this.prisma.event.create({
        data: {
          eventId,
          tenantId,
          campaignId,
          eventType,
          payload,
        },
      });

      this.logger.log(`Event processed: ${eventId} for tenant ${tenantId}`);
    } catch (error: any) {
      // Handle unique constraint violation (P2002) - this is idempotent, so we silently skip
      if (error.code === 'P2002') {
        this.logger.log(`Duplicate event skipped (idempotent): ${eventId}`);
        return;
      }

      // For other errors, throw to trigger retry
      this.logger.error(`Error processing event ${eventId}:`, error);
      throw error;
    }
  }
}
