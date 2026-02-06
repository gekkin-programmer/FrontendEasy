import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Database Cleanup...');

  // 1. Identify users to KEEP (Admins)
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true }
  });
  
  const adminIds = admins.map(a => a.id);
  console.log(`🛡️ Preserving ${admins.length} Admin(s):`, admins.map(a => a.email).join(', '));

  // 2. Identify users to DELETE
  const usersToDelete = await prisma.user.findMany({
    where: { 
      NOT: { role: 'ADMIN' }
    },
    select: { id: true }
  });
  const userIdsToDelete = usersToDelete.map(u => u.id);

  if (userIdsToDelete.length === 0) {
    console.log('✅ No non-admin users found. Database is already clean.');
    return;
  }

  console.log(`🧹 Cleaning up data for ${userIdsToDelete.length} non-admin users...`);

  // --- CASCADE DELETE WORKAROUND (for models without cascade in schema) ---

  // Delete Social Accounts
  const saCount = await prisma.socialAccount.deleteMany({
    where: { createdById: { in: userIdsToDelete } }
  });
  console.log(`🔹 Deleted ${saCount.count} Social Accounts`);

  // Delete Tasks
  const taskCount = await prisma.task.deleteMany({
    where: { 
      OR: [
        { createdById: { in: userIdsToDelete } },
        { assignedToId: { in: userIdsToDelete } }
      ]
    }
  });
  console.log(`🔹 Deleted ${taskCount.count} Tasks`);

  // Delete Media Library
  const mediaCount = await prisma.mediaLibrary.deleteMany({
    where: { uploaderId: { in: userIdsToDelete } }
  });
  console.log(`🔹 Deleted ${mediaCount.count} Media Library items`);

  // Delete Chat Messages
  const chatMsgCount = await prisma.chatMessage.deleteMany({
    where: { senderId: { in: userIdsToDelete } }
  });
  console.log(`🔹 Deleted ${chatMsgCount.count} Chat Messages`);

  // Delete Activity Logs
  const activityCount = await prisma.activityLog.deleteMany({
    where: { userId: { in: userIdsToDelete } }
  });
  console.log(`🔹 Deleted ${activityCount.count} Activity Logs`);

  // Delete Sessions
  const sessionCount = await prisma.session.deleteMany({
    where: { userId: { in: userIdsToDelete } }
  });
  console.log(`🔹 Deleted ${sessionCount.count} Sessions`);

  // --- MODELS WITH CASCADE DELETE (Will be handled by deleting User/Workspace) ---
  // Workspaces, WorkspaceMembers, Posts, PostComments, etc. are already configured 
  // with onDelete: Cascade in the prisma schema.

  // Delete Users (This will trigger cascade for Workspaces, Posts, etc.)
  const userCount = await prisma.user.deleteMany({
    where: { id: { in: userIdsToDelete } }
  });
  console.log(`✨ Successfully deleted ${userCount.count} non-admin Users and all their associated data.`);

  console.log('🏁 Cleanup Complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
