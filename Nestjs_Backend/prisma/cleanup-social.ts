import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting SocialAccount cleanup...');

  // 1. Find all duplicate accounts
  const duplicates = await prisma.$queryRaw`
    SELECT platform, "platformUserId", COUNT(*)
    FROM social_accounts
    GROUP BY platform, "platformUserId"
    HAVING COUNT(*) > 1
  ` as any[];

  console.log(`Found ${duplicates.length} account identities with duplicates.`);

  for (const dup of duplicates) {
    // Get all records for this identity, ordered by most recent update
    const records = await prisma.socialAccount.findMany({
      where: {
        platform: dup.platform,
        platformUserId: dup.platformUserId
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Keep the first (most recent), delete the rest
    const toDelete = records.slice(1);
    for (const record of toDelete) {
      await prisma.socialAccount.delete({
        where: { id: record.id }
      });
      console.log(`🗑️ Deleted duplicate ${dup.platform} account for @${record.username} (ID: ${record.id})`);
    }
  }

  console.log('✅ Cleanup complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
