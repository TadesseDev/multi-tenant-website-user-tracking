import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsConsumer } from './events.consumer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    SqsModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const sqsConfig = configService.get('aws');
        return {
          consumers: [
            {
              name: 'event-ingestion',
              queueUrl: sqsConfig.sqs.queueUrl,
              region: sqsConfig.region,

              clientOptions: {
                endpoint: sqsConfig.endpointUrl,
                region: sqsConfig.region,
                credentials: {
                  accessKeyId: sqsConfig.accessKeyId,
                  secretAccessKey: sqsConfig.secretAccessKey,
                },
              } as any,
            },
          ],
          producers: [
            {
              name: 'event-ingestion',
              queueUrl: sqsConfig.sqs.queueUrl,
              region: sqsConfig.region,

              clientOptions: {
                endpoint: sqsConfig.endpointUrl,
                region: sqsConfig.region,
                credentials: {
                  accessKeyId: sqsConfig.accessKeyId,
                  secretAccessKey: sqsConfig.secretAccessKey,
                },
              } as any,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EventsService, EventsConsumer],
  controllers: [EventsController],
})
export class EventsModule {}
