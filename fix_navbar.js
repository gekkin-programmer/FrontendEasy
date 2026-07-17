const fs = require('fs');

const file = 'C:/Users/BC-USER/Desktop/FrontendEasy/src/components/layout/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Tarifs
content = content.replace(
  /<div className=\"h-full flex items-center gap-\[4px\] cursor-pointer\">\s*<span>\{t\(\"Pricing\", \"Tarifs\"\)\}<\/span>\s*<\/div>/,
  '<Link href="/tarifs" className="h-full flex items-center gap-[4px] cursor-pointer">\n          <span>{t("Pricing", "Tarifs")}</span>\n        </Link>'
);

// Replace Canaux social media items
const regex = /<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item flex items-center gap-\[16px\]\">([\s\S]*?)<h3[^>]*>([^<]+)<\/h3>([\s\S]*?)<\/div>/g;

content = content.replace(regex, (match, p1, p2, p3) => {
  const slug = p2 === 'Twitter (X)' ? 'twitter' : p2.toLowerCase().replace(/\s+/g, '-');
  return '<Link href="/canaux/' + slug + '" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">' + p1 + '<h3 className="text-[18px] text-white font-bold mb-1 transition-colors">' + p2 + '</h3>' + p3 + '</Link>';
});

// Replace Fonctionnalites items
const funcRegex = /<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item\">\s*<h3 className=\"text-\[18px\] text-white font-bold transition-colors\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\s*<\/div>/g;

content = content.replace(funcRegex, (match, enName, frName) => {
  const slug = frName.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return '<Link href="/fonctionnalites/' + slug + '" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">\n                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("' + enName + '", "' + frName + '")}</h3>\n                </Link>';
});

// Replace Ressources items
const resRegex = /<div className=\"text-white\/80\">\s*<h3 className=\"text-\[18px\] text-white font-bold mb-2\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\s*<p className=\"text-\[14px\]\">([\s\S]*?)<\/p>\s*<\/div>/g;

content = content.replace(resRegex, (match, enName, frName, pContent) => {
  const slug = frName.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return '<Link href="/ressources/' + slug + '" className="text-white/80 block hover:text-white transition-colors">\n                  <h3 className="text-[18px] text-white font-bold mb-2">{t("' + enName + '", "' + frName + '")}</h3>\n                  <p className="text-[14px]">' + pContent + '</p>\n                </Link>';
});

fs.writeFileSync(file, content);
console.log('Navbar updated successfully.');
