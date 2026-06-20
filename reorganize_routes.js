const fs = require('fs');
const path = require('path');

const moveMap = {
  // Auth
  'src/app/login': 'src/app/(auth)/login',
  'src/app/signup': 'src/app/(auth)/signup',
  'src/app/forgot-password': 'src/app/(auth)/forgot-password',
  'src/app/reset-password': 'src/app/(auth)/reset-password',

  // Marketing
  'src/app/about': 'src/app/(marketing)/about',
  'src/app/pricing': 'src/app/(marketing)/pricing',
  'src/app/help': 'src/app/(marketing)/help',
  'src/app/legal': 'src/app/(marketing)/legal',
  'src/app/community': 'src/app/(marketing)/community',
  'src/app/creator-fund': 'src/app/(marketing)/creator-fund',
};

for (const [oldPath, newPath] of Object.entries(moveMap)) {
  const dir = path.dirname(newPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${oldPath} to ${newPath}`);
  }
}
