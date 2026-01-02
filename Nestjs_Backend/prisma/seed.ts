import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = 'admin@socialmedia.com';
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        accountType: 'ADMIN',
      },
    });
    console.log('Admin user created');
  }

  // Create test user
  const testEmail = 'test@socialmedia.com';
  const testUserExists = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!testUserExists) {
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    await prisma.user.create({
      data: {
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        accountType: 'PERSONAL',
      },
    });
    console.log('Test user created');
  }

  // Create sample workspace for test user
  const testUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (testUser) {
    const workspaceExists = await prisma.workspace.findFirst({
      where: { ownerId: testUser.id },
    });

    if (!workspaceExists) {
      const workspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          slug: 'my-workspace',
          ownerId: testUser.id,
        },
      });

      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: testUser.id,
          role: 'OWNER',
        },
      });
      console.log('Test workspace created');
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });