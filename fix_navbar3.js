const fs = require('fs');
let content = fs.readFileSync('C:/Users/BC-USER/Desktop/FrontendEasy/src/components/layout/Navbar.tsx', 'utf8');

// Tarifs
content = content.replace(
  /<div className=\"h-full flex items-center gap-\[4px\] cursor-pointer\">\r?\n\s*<span>\{t\(\"Pricing\", \"Tarifs\"\)\}<\/span>\r?\n\s*<\/div>/,
  `<Link href="/tarifs" className="h-full flex items-center gap-[4px] cursor-pointer">
          <span>{t("Pricing", "Tarifs")}</span>
        </Link>`
);

// Canaux
content = content.replace(
  /\{\/\* ([\w\s\(\)]+) \*\/\}\r?\n(\s*)<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item flex items-center gap-\[16px\]\">([\s\S]*?)<\/div>\r?\n\s*<\/div>/g,
  (match, name, indent, innerContent) => {
    const slug = name === 'Twitter (X)' ? 'twitter' : name.toLowerCase().replace(/\s+/g, '-');
    return `{/* ${name} */}
${indent}<Link href="/canaux/${slug}" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">${innerContent}</div>
${indent}</Link>`;
  }
);

// Fonctionnalites
content = content.replace(
  /<div className=\"text-white\/80 hover:text-white transition-colors cursor-pointer group\/item\">\r?\n\s*<h3 className=\"text-\[18px\] text-white font-bold transition-colors\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\r?\n\s*<\/div>/g,
  (match, enName, frName) => {
    const slug = frName.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `<Link href="/fonctionnalites/${slug}" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item block">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("${enName}", "${frName}")}</h3>
                </Link>`;
  }
);

// Ressources
content = content.replace(
  /<div className=\"text-white\/80\">\r?\n\s*<h3 className=\"text-\[18px\] text-white font-bold mb-2\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/h3>\r?\n\s*<p className=\"text-\[14px\]\">\{t\(\"([^\"]+)\",\s*\"([^\"]+)\"\)\}<\/p>\r?\n\s*<\/div>/g,
  (match, h3En, h3Fr, pEn, pFr) => {
    const slug = h3Fr.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `<Link href="/ressources/${slug}" className="text-white/80 block hover:text-white transition-colors">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("${h3En}", "${h3Fr}")}</h3>
                  <p className="text-[14px]">{t("${pEn}", "${pFr}")}</p>
                </Link>`;
  }
);

fs.writeFileSync('C:/Users/BC-USER/Desktop/FrontendEasy/src/components/layout/Navbar.tsx', content);
console.log('Success');
