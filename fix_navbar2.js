const fs = require('fs');
const file = 'C:/Users/BC-USER/Desktop/FrontendEasy/src/components/layout/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Tarifs
content = content.replace(
  /\{\/\* Frame 17: Tarifs \*\/\}\r?\n\s*<div className="h-full flex items-center gap-\[4px\] cursor-pointer\">\r?\n\s*<span>\{t\("Pricing", "Tarifs"\)\}<\/span>\r?\n\s*<\/div>/,
  `{/* Frame 17: Tarifs */}
        <Link href="/tarifs" className="h-full flex items-center gap-[4px] cursor-pointer">
          <span>{t("Pricing", "Tarifs")}</span>
        </Link>`
);

// Replace Canaux
content = content.replace(
  /\{\/\* ([\w\s\(\)]+) \*\/\}\r?\n\s*<div className="text-white\/80 hover:text-white transition-colors cursor-pointer group\/item flex items-center gap-\[16px\]">([\s\S]*?)\r?\n\s*<\/div>/g,
  (match, name, innerContent) => {
    const slug = name === 'Twitter (X)' ? 'twitter' : name.toLowerCase().replace(/\s+/g, '-');
    return `{/* ${name} */}
                <Link href="/canaux/${slug}" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item flex items-center gap-[16px]">${innerContent}
                </Link>`;
  }
);

// Replace Fonctionnalites
content = content.replace(
  /<div className="text-white\/80 hover:text-white transition-colors cursor-pointer group\/item">\r?\n\s*<h3 className="text-\[18px\] text-white font-bold transition-colors">\{t\("([^"]+)", "([^"]+)"\)\}<\/h3>\r?\n\s*<\/div>/g,
  (match, enName, frName) => {
    const slug = frName.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `<Link href="/fonctionnalites/${slug}" className="text-white/80 hover:text-white transition-colors cursor-pointer group/item">
                  <h3 className="text-[18px] text-white font-bold transition-colors">{t("${enName}", "${frName}")}</h3>
                </Link>`;
  }
);

// Replace Ressources
content = content.replace(
  /<div className="text-white\/80">\r?\n\s*<h3 className="text-\[18px\] text-white font-bold mb-2">\{t\("([^"]+)", "([^"]+)"\)\}<\/h3>\r?\n\s*<p className="text-\[14px\]">\{t\("([^"]+)", "([^"]+)"\)\}<\/p>\r?\n\s*<\/div>/g,
  (match, h3En, h3Fr, pEn, pFr) => {
    const slug = h3Fr.toLowerCase().replace(/['\s]+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `<Link href="/ressources/${slug}" className="text-white/80 block hover:text-white transition-colors">
                  <h3 className="text-[18px] text-white font-bold mb-2">{t("${h3En}", "${h3Fr}")}</h3>
                  <p className="text-[14px]">{t("${pEn}", "${pFr}")}</p>
                </Link>`;
  }
);

fs.writeFileSync(file, content);
console.log("Done");
