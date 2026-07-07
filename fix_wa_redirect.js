const fs = require('fs');
const path = 'app/dpl/validasi/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. In handleBulkValidasi, remove the window.open part and update toast
content = content.replace(
  /showToast\(\`Tautan berhasil dibuat! Membuka WhatsApp...\`\);([\s\S]*?)window\.open\(\`whatsapp:\/\/send\?text=\$\{waText\}\`\);/,
  `showToast(\`Tautan berhasil dibuat!\`);$1` // keep everything in between except window.open
);

// 2. Change the Modal text
content = content.replace(
  'WhatsApp Anda seharusnya sudah terbuka otomatis. Jika tidak, Anda bisa menyalin tautan di bawah ini dan mengirimkannya secara manual ke Mentor.',
  'Silakan salin tautan (link) di bawah ini lalu kirimkan ke WhatsApp Mentor untuk divalidasi atau disetujui.'
);

// 3. Just to be safe, if handleCopyLinkMentor also tries to open WA (it shouldn't, but let's check).
// Wait, I implemented handleCopyLinkMentor using navigator.clipboard.writeText. It doesn't open WA. So it's fine.

fs.writeFileSync(path, content);
