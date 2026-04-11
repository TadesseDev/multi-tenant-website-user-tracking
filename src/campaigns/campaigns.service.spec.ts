import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAccessException } from '../common/exceptions/tenant-access.exception';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prismaService: PrismaService;

  const mockCampaign = {
    id: 'campaign-123',
    name: 'Test Campaign',
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    campaign: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a campaign for a tenant', async () => {
      mockPrismaService.campaign.create.mockResolvedValueOnce(mockCampaign);

      const result = await service.create('tenant-123', {
        name: 'Test Campaign',
      });

      expect(result).toEqual(mockCampaign);
      expect(mockPrismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Campaign',
          tenantId: 'tenant-123',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return campaigns for a tenant', async () => {
      mockPrismaService.campaign.findMany.mockResolvedValueOnce([mockCampaign]);

      const result = await service.findAll('tenant-123');

      expect(result).toEqual([mockCampaign]);
      expect(mockPrismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a campaign when tenant has access', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(mockCampaign);

      const result = await service.findOne('campaign-123', 'tenant-123');

      expect(result).toEqual(mockCampaign);
    });

    it('should throw TenantAccessException when campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent', 'tenant-123')).rejects.toThrow(
        TenantAccessException,
      );
    });

    it('should throw TenantAccessException on tenant mismatch', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({
        ...mockCampaign,
        tenantId: 'different-tenant',
      });

      await expect(service.findOne('campaign-123', 'tenant-123')).rejects.toThrow(
        TenantAccessException,
      );
    });
  });
});
