-- AlterTable: Add unique constraint on (tenantId, name) for Campaign
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_tenantId_name_key" UNIQUE ("tenantId", "name");
