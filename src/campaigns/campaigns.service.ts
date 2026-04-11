import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAccessException } from '../common/exceptions/tenant-access.exception';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    createCampaignDto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: createCampaignDto.name,
        tenantId,
      },
    });

    return this.mapToResponse(campaign);
  }

  async findAll(tenantId: string): Promise<CampaignResponseDto[]> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => this.mapToResponse(campaign));
  }

  async findOne(id: string, tenantId: string): Promise<CampaignResponseDto> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new TenantAccessException('Campaign not found');
    }

    if (campaign.tenantId !== tenantId) {
      throw new TenantAccessException('Access denied: Cannot access this campaign');
    }

    return this.mapToResponse(campaign);
  }

  private mapToResponse(campaign: any): CampaignResponseDto {
    return {
      id: campaign.id,
      name: campaign.name,
      tenantId: campaign.tenantId,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }
}
