import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(ent.name)) walk(p, files);
    } else if (/\.(vue|ts|tsx|js)$/.test(ent.name)) files.push(p);
  }
  return files;
}

function extractDefinedKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();
  const re = /['"]([a-zA-Z][a-zA-Z0-9_.-]+)['"]\s*:/g;
  let m;
  while ((m = re.exec(content)) !== null) keys.add(m[1]);
  return keys;
}

function extractUsedKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Map();
  const patterns = [
    /\bt\(\s*['"]([a-zA-Z][a-zA-Z0-9_.-]+)['"]/g,
    /\$t\(\s*['"]([a-zA-Z][a-zA-Z0-9_.-]+)['"]/g,
    /i18n\.t\(\s*['"]([a-zA-Z][a-zA-Z0-9_.-]+)['"]/g,
  ];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        const key = m[1];
        if (!keys.has(key)) keys.set(key, []);
        keys.get(key).push({ file: filePath, line: idx + 1 });
      }
    }
  });
  return keys;
}

const localeFiles = walk(root).filter((f) => f.includes(`${path.sep}locale${path.sep}`) && f.endsWith('.ts'));
const zhMain = path.join(root, 'locale/zh-CN.ts');
const enMain = path.join(root, 'locale/en-US.ts');

const zhDefined = new Set();
const enDefined = new Set();

for (const f of localeFiles) {
  for (const k of extractDefinedKeys(f)) {
    if (f.includes('zh-CN')) zhDefined.add(k);
    if (f.includes('en-US')) enDefined.add(k);
  }
}
for (const k of extractDefinedKeys(zhMain)) zhDefined.add(k);
for (const k of extractDefinedKeys(enMain)) enDefined.add(k);

const srcFiles = walk(root).filter((f) => !f.includes(`${path.sep}locale${path.sep}`));
const usedKeys = new Map();
for (const f of srcFiles) {
  for (const [k, refs] of extractUsedKeys(f)) {
    if (!usedKeys.has(k)) usedKeys.set(k, []);
    usedKeys.get(k).push(...refs);
  }
}

const missingBoth = [];
const missingZh = [];
const missingEn = [];

for (const [key, refs] of [...usedKeys.entries()].sort()) {
  const inZh = zhDefined.has(key);
  const inEn = enDefined.has(key);
  if (!inZh || !inEn) {
    const item = { key, refs: refs.slice(0, 3), inZh, inEn };
    if (!inZh && !inEn) missingBoth.push(item);
    else if (!inZh) missingZh.push(item);
    else missingEn.push(item);
  }
}

function printSection(title, items) {
  console.log(`\n=== ${title} (${items.length}) ===`);
  for (const { key, refs } of items) {
    console.log(key);
    for (const r of refs) {
      console.log(`  ${path.relative(root, r.file)}:${r.line}`);
    }
  }
}

printSection('Missing in BOTH zh-CN and en-US', missingBoth);
printSection('Missing in zh-CN only', missingZh);
printSection('Missing in en-US only', missingEn);
console.log(
  `\nSummary: both=${missingBoth.length}, zhOnly=${missingZh.length}, enOnly=${missingEn.length}, totalUsed=${usedKeys.size}`,
);

// Locale file parity (defined keys only)
const zhOnlyDefined = [...zhDefined].filter((k) => !enDefined.has(k)).sort();
const enOnlyDefined = [...enDefined].filter((k) => !zhDefined.has(k)).sort();
printSection('Defined in zh-CN but missing in en-US locale files', zhOnlyDefined.map((key) => ({ key, refs: [] })));
printSection('Defined in en-US but missing in zh-CN locale files', enOnlyDefined.map((key) => ({ key, refs: [] })));
console.log(`\nLocale parity: zhOnlyDefined=${zhOnlyDefined.length}, enOnlyDefined=${enOnlyDefined.length}`);
