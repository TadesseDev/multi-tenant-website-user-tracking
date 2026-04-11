import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { DailyAggregationDto } from './dto/daily-aggregation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('campaigns/:campaignId/daily')
  @Roles(Role.TENANT_ADMIN, Role.TENANT_USER)
  @ApiOperation({
    summary: 'Get daily event analytics for a campaign',
    description: 'Returns daily aggregated event counts grouped by event type',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily aggregation data',
    type: [DailyAggregationDto],
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getDailyAggregation(
    @Param('campaignId') campaignId: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DailyAggregationDto[]> {
    return this.analyticsService.getDailyAggregation(
      campaignId,
      user.tenantId,
      query.startDate,
      query.endDate,
    );
  }
}
