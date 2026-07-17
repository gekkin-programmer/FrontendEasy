const fs = require('fs');
let content = fs.readFileSync('C:/Users/BC-USER/Desktop/FrontendEasy/src/components/layout/Navbar.tsx', 'utf8');

const tMatch = content.match(/<div className=\"h-full flex items-center gap-\[4px\] cursor-pointer\">\r?\n\s*<span>\{t\(\"Pricing\", \"Tarifs\"\)\}<\/span>\r?\n\s*<\/div>/);
console.log('Tarifs matched:', !!tMatch);

const cMatch = content.match(/\{\/\* ([\w\s\(\)]+) \*\/\}\r?\n(\s*)<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item flex items-center gap-\[16px\]\">([\s\S]*?)<\/div>\r?\n\s*<\/div>/);
console.log('Canaux matched:', !!cMatch);

const fMatch = content.match(/<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item\">\r?\n\s*<h3 className=\"text-\[18px\] text-white font-bold transition-colors\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\r?\n\s*<\/div>/);
console.log('Fonctionnalites matched:', !!fMatch);

const rMatch = content.match(/<div className=\"text-white\/80\">\r?\n\s*<h3 className=\"text-\[18px\] text-white font-bold mb-2\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\r?\n\s*<p className=\"text-\[14px\]\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/p>\r?\n\s*<\/div>/);
console.log('Ressources matched:', !!rMatch);
