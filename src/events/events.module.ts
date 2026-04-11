import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsProcessor } from './events.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'event-ingestion',
    }),
  ],
  providers: [EventsService, EventsProcessor],
  controllers: [EventsController],
})
export class EventsModule {}
