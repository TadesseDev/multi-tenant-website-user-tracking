import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAccessException } from '../common/exceptions/tenant-access.exception';
import { DailyAggregationDto } from './dto/daily-aggregation.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDailyAggregation(
    campaignId: string,
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyAggregationDto[]> {
    // Verify campaign belongs to tenant
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.tenantId !== tenantId) {
      throw new TenantAccessException(
        'Cannot access analytics for this campaign',
      );
    }

    // Query aggregated event data grouped by date and event type
    const results = await this.prisma.$queryRaw<
      Array<{ date: string; event_type: string; count: bigint }>
    >`
      SELECT
        DATE("processedAt") AS date,
        "eventType" AS event_type,
        COUNT(*) AS count
      FROM "Event"
      WHERE
        "tenantId" = ${tenantId}
        AND "campaignId" = ${campaignId}
        AND "processedAt" >= ${new Date(startDate)}
        AND "processedAt" < ${new Date(new Date(endDate).getTime() + 86400000)}
      GROUP BY DATE("processedAt"), "eventType"
      ORDER BY date ASC, event_type ASC
    `;

    // Convert bigint to number and format dates
    return results.map((row) => ({
      date: row.date,
      eventType: row.event_type,
      count: Number(row.count),
    }));
  }
}
