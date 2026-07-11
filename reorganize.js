const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const moveMap = {
  // layout
  'src/components/Navbar.tsx': 'src/components/layout/Navbar.tsx',
  'src/components/Footer.tsx': 'src/components/layout/Footer.tsx',

  // common
  'src/components/AnimatedCounter.tsx': 'src/components/common/AnimatedCounter.tsx',
  'src/components/AgentationLoader.tsx': 'src/components/common/AgentationLoader.tsx',
  'src/components/AgentationWrapper.tsx': 'src/components/common/AgentationWrapper.tsx',
  'src/components/SpinningLoader.tsx': 'src/components/common/SpinningLoader.tsx',

  // landing
  'src/components/Hero.tsx': 'src/components/landing/Hero.tsx',
  'src/components/HeroBackground.tsx': 'src/components/landing/HeroBackground.tsx',
  'src/components/AProposSection.tsx': 'src/components/landing/AProposSection.tsx',
  'src/components/AnalyzeSection.tsx': 'src/components/landing/AnalyzeSection.tsx',
  'src/components/CTA.tsx': 'src/components/landing/CTA.tsx',
  'src/components/CollaborateSection.tsx': 'src/components/landing/CollaborateSection.tsx',
  'src/components/ConnectSection.tsx': 'src/components/landing/ConnectSection.tsx',
  'src/components/ContactSection.tsx': 'src/components/landing/ContactSection.tsx',
  'src/components/CreateSection.tsx': 'src/components/landing/CreateSection.tsx',
  'src/components/DevicesSection.tsx': 'src/components/landing/DevicesSection.tsx',
  'src/components/EngageSection.tsx': 'src/components/landing/EngageSection.tsx',
  'src/components/FaqSection.tsx': 'src/components/landing/FaqSection.tsx',
  'src/components/Features.tsx': 'src/components/landing/Features.tsx',
  'src/components/GrowSection.tsx': 'src/components/landing/GrowSection.tsx',
  'src/components/ImpactSection.tsx': 'src/components/landing/ImpactSection.tsx',
  'src/components/LandingSections.tsx': 'src/components/landing/LandingSections.tsx',
  'src/components/PublishSection.tsx': 'src/components/landing/PublishSection.tsx',
  'src/components/ResourceCard.tsx': 'src/components/landing/ResourceCard.tsx',
  'src/components/ResourceSection.tsx': 'src/components/landing/ResourceSection.tsx',
  'src/components/ResourcesSection.tsx': 'src/components/landing/ResourcesSection.tsx',
  'src/components/ScrollReveal.tsx': 'src/components/landing/ScrollReveal.tsx',
  'src/components/SectionBackground.tsx': 'src/components/landing/SectionBackground.tsx',
  'src/components/SocialProof.tsx': 'src/components/landing/SocialProof.tsx',
  'src/components/StatsSection.tsx': 'src/components/landing/StatsSection.tsx',
  'src/components/SupportSection.tsx': 'src/components/landing/SupportSection.tsx',
  'src/components/Testimonials.tsx': 'src/components/landing/Testimonials.tsx',
  'src/components/UsersSection.tsx': 'src/components/landing/UsersSection.tsx',

  // folders
  'src/components/easypost': 'src/features/dashboard/easypost',
  'src/components/eazypost': 'src/features/dashboard/eazypost',
  'src/components/pour': 'src/features/pour/components',
  'src/components/hero': 'src/components/landing/hero'
};

// Create dirs
const dirs = new Set(Object.values(moveMap).map(p => path.dirname(p)));
for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

// Prepare import replacements
// e.g. "@/components/Navbar" -> "@/components/layout/Navbar"
// "@/components/easypost/Sidebar" -> "@/features/dashboard/easypost/Sidebar"
const importReplacements = Object.entries(moveMap).map(([oldPath, newPath]) => {
  const oldImport = oldPath.replace(/^src\//, '@/').replace(/\.tsx?$/, '');
  const newImport = newPath.replace(/^src\//, '@/').replace(/\.tsx?$/, '');
  return { oldImport, newImport };
});

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  }
}

// 1. Move files
for (const [oldPath, newPath] of Object.entries(moveMap)) {
  if (fs.existsSync(oldPath)) {
    console.log(`Moving ${oldPath} to ${newPath}`);
    fs.renameSync(oldPath, newPath);
  }
}

// 2. Update imports
walk(srcDir, (p) => {
  if (p.endsWith('.ts') || p.endsWith('.tsx')) {
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;
    for (const { oldImport, newImport } of importReplacements) {
      // Regex to match exact import path, considering quotes
      // e.g. from "@/components/Navbar"
      const regex = new RegExp(`(['"])${oldImport}(['"\\/])`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `$1${newImport}$2`);
        changed = true;
      }
    }
    if (changed) {
      console.log(`Updated imports in ${p}`);
      fs.writeFileSync(p, content, 'utf8');
    }
  }
});
