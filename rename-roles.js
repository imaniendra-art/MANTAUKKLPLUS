const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /lppm/g, to: 'lppm' },
  { from: /LPPM/g, to: 'LPPM' },
  { from: /lppm/g, to: 'lppm' }
];

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      if (!['node_modules', '.git', '.next', '.gemini'].includes(file)) {
        walkSync(filepath, callback);
      }
    } else if (stats.isFile() && (filepath.endsWith('.js') || filepath.endsWith('.jsx') || filepath.endsWith('.md'))) {
      callback(filepath);
    }
  });
}

walkSync(__dirname, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;
  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
