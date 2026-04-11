import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up existing data (in reverse order of dependencies)
  await prisma.event.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('✓ Cleaned up existing data');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create tenants
  const acmeTenant = await prisma.tenant.create({
    data: {
      name: 'ACME Corporation',
      slug: 'acme-corp',
    },
  });

  const betaTenant = await prisma.tenant.create({
    data: {
      name: 'Beta Inc',
      slug: 'beta-inc',
    },
  });

  console.log('✓ Created 2 tenants');

  // Create users for ACME
  await prisma.user.create({
    data: {
      email: 'admin@acme-corp.com',
      passwordHash: adminPassword,
      role: 'TENANT_ADMIN',
      tenantId: acmeTenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@acme-corp.com',
      passwordHash: userPassword,
      role: 'TENANT_USER',
      tenantId: acmeTenant.id,
    },
  });

  // Create users for Beta
  await prisma.user.create({
    data: {
      email: 'admin@beta-inc.com',
      passwordHash: adminPassword,
      role: 'TENANT_ADMIN',
      tenantId: betaTenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@beta-inc.com',
      passwordHash: userPassword,
      role: 'TENANT_USER',
      tenantId: betaTenant.id,
    },
  });

  console.log('✓ Created 4 users (2 per tenant)');

  // Create campaigns for ACME
  const acmeCampaign1 = await prisma.campaign.create({
    data: {
      name: 'Summer Campaign 2026',
      tenantId: acmeTenant.id,
    },
  });

  const acmeCampaign2 = await prisma.campaign.create({
    data: {
      name: 'Q2 Product Launch',
      tenantId: acmeTenant.id,
    },
  });

  // Create campaigns for Beta
  const betaCampaign1 = await prisma.campaign.create({
    data: {
      name: 'Beta Testing Phase',
      tenantId: betaTenant.id,
    },
  });

  const betaCampaign2 = await prisma.campaign.create({
    data: {
      name: 'Market Expansion',
      tenantId: betaTenant.id,
    },
  });

  console.log('✓ Created 4 campaigns (2 per tenant)');

  // Create sample events for ACME campaigns
  const eventIds = [
    'evt_001_acme_summer',
    'evt_002_acme_summer',
    'evt_003_acme_q2',
    'evt_001_beta_test',
    'evt_002_beta_test',
    'evt_003_beta_market',
  ];

  const events = [
    {
      eventId: eventIds[0],
      tenantId: acmeTenant.id,
      campaignId: acmeCampaign1.id,
      eventType: 'page_view',
      payload: { page: '/summer-sale', user_id: 'user_123' },
    },
    {
      eventId: eventIds[1],
      tenantId: acmeTenant.id,
      campaignId: acmeCampaign1.id,
      eventType: 'add_to_cart',
      payload: { product_id: 'prod_456', quantity: 2 },
    },
    {
      eventId: eventIds[2],
      tenantId: acmeTenant.id,
      campaignId: acmeCampaign2.id,
      eventType: 'click',
      payload: { element: 'hero_button', section: 'landing' },
    },
    {
      eventId: eventIds[3],
      tenantId: betaTenant.id,
      campaignId: betaCampaign1.id,
      eventType: 'page_view',
      payload: { page: '/beta-signup', user_id: 'user_beta_001' },
    },
    {
      eventId: eventIds[4],
      tenantId: betaTenant.id,
      campaignId: betaCampaign1.id,
      eventType: 'form_submit',
      payload: { form_id: 'beta_form', status: 'success' },
    },
    {
      eventId: eventIds[5],
      tenantId: betaTenant.id,
      campaignId: betaCampaign2.id,
      eventType: 'page_view',
      payload: { page: '/expansion-info', user_id: 'user_beta_002' },
    },
  ];

  for (const event of events) {
    // TODO: I'll have to find a better way to seed events in bulk without hitting rate limits
    await prisma.event.create({
      data: event,
    });
  }

  console.log('✓ Created 6 sample events');

  console.log('\n📊 Seed Summary:');
  console.log(`   ✓ 2 Tenants created`);
  console.log(`   ✓ 4 Users created`);
  console.log(`   ✓ 4 Campaigns created`);
  console.log(`   ✓ 6 Events seeded`);
  console.log('\n🎯 Test Credentials:');
  console.log(`   ACME Admin:  admin@acme-corp.com / admin123`);
  console.log(`   ACME User:   user@acme-corp.com / user123`);
  console.log(`   Beta Admin:  admin@beta-inc.com / admin123`);
  console.log(`   Beta User:   user@beta-inc.com / user123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
