// i18n coverage checker.
// Scans all t("en", "fr"[, "ar"]) calls in src/ and reports keys missing from
// src/locales/en.json, fr.json or ar.json. Run with: pnpm i18n:check
// Every user-facing string must go through t() — the JSON files are the source
// of truth for all three languages (Arabic falls back to English otherwise).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const SKIP = /features[\\/]dashboard[\\/]eazypost/; // dead code folder

const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/en.json'), 'utf8'));
const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/fr.json'), 'utf8'));
const ar = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/locales/ar.json'), 'utf8'));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

const STR = `(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)')`;
const CALL_RE = new RegExp(`\\bt\\(\\s*${STR}\\s*,\\s*${STR}\\s*(?:,\\s*${STR}\\s*)?\\)`, 'g');

let problems = 0;
for (const f of walk(SRC)) {
  if (SKIP.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = CALL_RE.exec(text)) !== null) {
    const key = (m[1] ?? m[2] ?? '').replace(/\\(['"])/g, '$1');
    if (!key) continue;
    const line = text.slice(0, m.index).split('\n').length;
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const missing = [];
    if (!(key in en)) missing.push('en');
    if (!(key in fr)) missing.push('fr');
    if (!(key in ar)) missing.push('ar');
    if (missing.length) {
      problems++;
      console.log(`${rel}:${line} missing [${missing.join(', ')}] for key: ${JSON.stringify(key.slice(0, 60))}`);
    }
  }
}

if (problems) {
  console.log(`\n${problems} t() call(s) with missing translations. Add the keys to src/locales/{en,fr,ar}.json.`);
  process.exit(1);
} else {
  console.log('i18n check passed: every t() key exists in en.json, fr.json and ar.json.');
}
