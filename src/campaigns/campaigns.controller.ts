import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @Roles(Role.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new campaign (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Campaign name already exists for this tenant',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.create(user.tenantId, createCampaignDto);
  }

  @Get()
  @Roles(Role.TENANT_ADMIN, Role.TENANT_USER)
  @ApiOperation({ summary: 'List all campaigns for current tenant' })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns',
    type: [CampaignResponseDto],
  })
  async findAll(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(Role.TENANT_ADMIN, Role.TENANT_USER)
  @ApiOperation({ summary: 'Get a specific campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign details',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id, user.tenantId);
  }
}
