const fs = require('fs');
const path = require('path');

const replacements = [
  // Text content
  { from: /Bursa Magang/g, to: 'Bursa KKL Plus' },
  { from: /Pengajuan Magang/g, to: 'Pengajuan KKL Plus' },
  { from: /pengajuan magang/g, to: 'pengajuan KKL Plus' },
  { from: /Posisi Magang/g, to: 'Posisi KKL Plus' },
  { from: /posisi magang/g, to: 'posisi KKL Plus' },
  { from: /Lokasi Magang/g, to: 'Lokasi KKL Plus' },
  { from: /lokasi magang/g, to: 'lokasi KKL Plus' },
  { from: /Data Magang/g, to: 'Data KKL Plus' },
  { from: /Monitoring Magang/g, to: 'Monitoring KKL Plus' },
  { from: /Petunjuk Magang/g, to: 'Petunjuk KKL Plus' },
  { from: /laporan magang/g, to: 'laporan KKL Plus' },
  { from: /Laporan Magang/g, to: 'Laporan KKL Plus' },
  { from: /Magang Berdampak/g, to: 'KKL Plus Berdampak' },
  { from: /aktivitas magang/g, to: 'aktivitas KKL Plus' },
  { from: /target magang/g, to: 'target KKL Plus' },
  { from: /anak magang/g, to: 'mahasiswa KKL Plus' },
  { from: /logbook magang/g, to: 'logbook KKL Plus' },
  { from: /bimbingan magang/g, to: 'bimbingan KKL Plus' },
  { from: /target_magang/g, to: 'target_kkl' },
  // Catch all for standalone Magang/magang if needed, but let's be safe.
  { from: /\bMagang\b/g, to: 'KKL Plus' },
  { from: /\bmagang\b/g, to: 'KKL Plus' },
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
    } else if (stats.isFile() && (filepath.endsWith('.js') || filepath.endsWith('.jsx'))) {
      callback(filepath);
    }
  });
}

const targetDirs = [path.join(__dirname, 'app'), path.join(__dirname, 'components')];

targetDirs.forEach(dir => {
  walkSync(dir, (filepath) => {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;
    
    // We only replace if the file is not an api route ? API routes might have text. Let's do all.
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated UI text in ${filepath}`);
    }
  });
});
