import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  "nkouambrayan@gmail.com",
  "brayannnkouam@gmail.com"
];

async function main() {
  console.log('🚀 Starting Admin Promotion...');

  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
      console.log(`✅ User ${email} is now an ADMIN.`);
    } else {
      console.log(`⚠️ User ${email} not found in database. Please log in once first.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
