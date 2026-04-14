import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import type { Message } from '@aws-sdk/client-sqs';
import { PrismaService } from '../prisma/prisma.service';

interface EventPayload {
  eventId: string;
  tenantId: string;
  campaignId: string;
  eventType: string;
  payload: string;
}

@Injectable()
export class EventsConsumer {
  private readonly logger = new Logger(EventsConsumer.name);

  constructor(private prisma: PrismaService) {}

  @SqsMessageHandler('event-ingestion')
  async handleEventMessage(message: Message): Promise<void> {
    try {
      if (!message.Body) {
        this.logger.warn('Received message with no body');
        return;
      }

      const body = JSON.parse(message.Body) as EventPayload;

      const { eventId, tenantId, campaignId, eventType, payload } = body;

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
        this.logger.log(
          `Duplicate event skipped (idempotent): ${(error.meta?.target as string[])?.[0]}`,
        );
        return;
      }

      // For other errors, throw to trigger retry
      this.logger.error('Error processing event:', error);
      throw error;
    }
  }
}
