import fs from 'fs';
import path from 'path';

function getFiles(dir, exts = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.next') && !full.includes('.git')) {
        results = results.concat(getFiles(full, exts));
      }
    } else {
      if (exts.includes(path.extname(full))) results.push(full);
    }
  }
  return results;
}

// Robust JSX tag finder that understands quotes & braces
function findFormTags(content) {
  const tags = [];
  const re = /<(input|select|textarea)\b/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    const start = m.index;
    const tagName = m[1];
    let i = start + m[0].length;
    let inBraces = 0;
    let inQuotes = null;
    while (i < content.length) {
      const char = content[i];
      if (!inQuotes && (char === '"' || char === "'" || char === '`')) {
        inQuotes = char;
      } else if (inQuotes && char === inQuotes && content[i - 1] !== '\\') {
        inQuotes = null;
      } else if (!inQuotes && char === '{') {
        inBraces++;
      } else if (!inQuotes && char === '}') {
        inBraces--;
      } else if (!inQuotes && inBraces === 0 && char === '>') {
        tags.push({ tagName, full: content.slice(start, i + 1), start, end: i + 1 });
        break;
      }
      i++;
    }
  }
  return tags;
}

const files = [...getFiles('./app'), ...getFiles('./components')];
const findings = [];

for (const file of files) {
  const normPath = file.replace(/\\/g, '/');
  // Skip print/A4 physical templates
  if (normPath.includes('/cetak/') || normPath.includes('/templates/')) continue;

  const content = fs.readFileSync(file, 'utf8');

  // 1. Check form controls
  const formTags = findFormTags(content);
  for (const tag of formTags) {
    const attrs = tag.full;
    if (attrs.includes('type="hidden"') || attrs.includes("type='hidden'") || 
       (attrs.includes('type="file"') && attrs.includes('hidden'))) {
      continue;
    }
    if (attrs.includes('type="checkbox"') || attrs.includes('type="radio"')) {
      continue;
    }

    const hasDarkBg = attrs.includes('dark:bg-');
    const hasDarkText = attrs.includes('dark:text-');

    if (!hasDarkBg || !hasDarkText) {
      const lineNum = content.slice(0, tag.start).split('\n').length;
      findings.push({
        file: normPath,
        line: lineNum,
        type: 'FORM_INPUT_MISSING_DARK',
        snippet: attrs.replace(/\s+/g, ' ').slice(0, 100)
      });
    }
  }

  // 2. Line-by-line checks
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trim();

    // Check base bg-white without dark:bg
    const baseBgWhite = /(?<!hover:|focus:|active:|peer-checked:|after:|before:)bg-white(\/\d+)?\b/.test(trimmed);
    if (baseBgWhite && !trimmed.includes('dark:bg-') && !trimmed.includes('// print') && !trimmed.includes('print:') && !trimmed.includes('21cm') && !trimmed.includes('210mm')) {
      findings.push({
        file: normPath,
        line: lineNum,
        type: 'BG_WHITE_NO_DARK',
        snippet: trimmed.slice(0, 100)
      });
    }

    // Check hardcoded dark text without dark:text
    const hasDarkText = /(?<!hover:|dark:|focus:|active:)text-(slate|gray|zinc|neutral)-(700|800|900)\b/.test(trimmed);
    if (hasDarkText && !trimmed.includes('dark:text-') && !trimmed.includes('print:') && !trimmed.includes('21cm') && !trimmed.includes('210mm')) {
      findings.push({
        file: normPath,
        line: lineNum,
        type: 'DARK_TEXT_NO_DARK_VARIANT',
        snippet: trimmed.slice(0, 100)
      });
    }

    // Check text-white without background
    if (trimmed.includes('text-white') && 
        !trimmed.includes('dark:text-white') &&
        !trimmed.includes('bg-teal') && 
        !trimmed.includes('bg-emerald') && 
        !trimmed.includes('bg-blue') && 
        !trimmed.includes('bg-indigo') && 
        !trimmed.includes('bg-amber') && 
        !trimmed.includes('bg-red') && 
        !trimmed.includes('bg-purple') && 
        !trimmed.includes('bg-slate-800') && 
        !trimmed.includes('bg-slate-900') && 
        !trimmed.includes('bg-black') && 
        !trimmed.includes('from-') && 
        !trimmed.includes('gradient') && 
        !trimmed.includes('dark:bg-')) {
      findings.push({
        file: normPath,
        line: lineNum,
        type: 'WHITE_TEXT_NO_EXPLICIT_BG',
        snippet: trimmed.slice(0, 100)
      });
    }
  });
}

console.log(`Audited ${files.length} files. Total findings: ${findings.length}`);

const byType = {};
findings.forEach(f => {
  byType[f.type] = (byType[f.type] || 0) + 1;
});
console.log('Findings by Category:', JSON.stringify(byType, null, 2));

const byFile = {};
findings.forEach(f => {
  byFile[f.file] = (byFile[f.file] || 0) + 1;
});
const sortedFiles = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
console.log('\nTop 20 Most Affected Files:');
sortedFiles.slice(0, 20).forEach(([f, cnt]) => {
  console.log(`- ${f}: ${cnt} issues`);
});

console.log('\n=== ALL DETAILED REMAINING FINDINGS ===');
findings.forEach(f => {
  console.log(`[${f.type}] ${f.file}:${f.line} -> ${f.snippet}`);
});
