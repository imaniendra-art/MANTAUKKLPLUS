const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
};

const files = [...walk('./app'), ...walk('./components')];

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Teal targets - Map everything to 'teal'
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-emerald-/g, '$1-teal-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-green-/g, '$1-teal-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-blue-/g, '$1-teal-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-cyan-/g, '$1-teal-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-indigo-/g, '$1-teal-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-purple-/g, '$1-teal-');
  
  // Hardcoded references to the old teal arbitrary value should just become teal-500 or teal-600
  // e.g. bg-[#1398A5] -> bg-teal-500
  content = content.replace(/\[#1398A5\]/g, 'teal-600');
  
  // Amber targets - Map everything to 'amber'
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-yellow-/g, '$1-amber-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-orange-/g, '$1-amber-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-rose-/g, '$1-amber-');
  content = content.replace(/\b(text|bg|border|ring|shadow|from|to|via)-pink-/g, '$1-amber-');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalReplaced++;
  }
});

console.log(`Replaced colors in ${totalReplaced} files.`);
