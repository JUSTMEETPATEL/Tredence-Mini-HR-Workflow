// ── Database Seed — populates Automations table ──────
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AUTOMATIONS = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employee_id', 'field', 'value'] },
];

async function seed() {
  console.log('🌱 Seeding database...');

  for (const automation of AUTOMATIONS) {
    await prisma.automation.upsert({
      where: { id: automation.id },
      update: { label: automation.label, params: automation.params },
      create: automation,
    });
  }

  console.log(`✅ Seeded ${AUTOMATIONS.length} automations`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
