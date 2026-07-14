const fs = require('fs');
const path = 'app/dpl/validasi/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add handleCopyLinkMentor and handleForceValidate before toggleSelectLog
const handlers = `
  const handleCopyLinkMentor = async (logs) => {
    const targetLogs = logs.filter(l => l.status_validasi === 'menunggu_mentor');
    const targetIds = targetLogs.map(l => l._id);
    if (targetIds.length === 0) return;
    
    setSubmitting(true);
    try {
      const firstLog = targetLogs[0];
      const payload = { 
        ids: targetIds, 
        dpl_id: session.user.id,
        pokja_id: firstLog?.pokja_id?._id || firstLog?.pokja_id,
        logbook_ids: targetIds
      };
      
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        const baseUrl = window.location.origin;
        const magicUrl = \`\${baseUrl}/v/\${data.token}\`;
        navigator.clipboard.writeText(magicUrl);
        showToast('Tautan disalin ke clipboard!');
      } else {
        alert("Gagal membuat tautan validasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForceValidate = async (logs) => {
    const targetLogs = logs.filter(l => l.status_validasi === 'menunggu_mentor').map(l => l._id);
    if (targetLogs.length === 0) return;

    if (!confirm(\`Anda yakin ingin memvalidasi \${targetLogs.length} logbook secara langsung (menggantikan Mentor)?\`)) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/logbook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: targetLogs,
          status_validasi: 'selesai'
        })
      });
      
      if (res.ok) {
        showToast(\`\${targetLogs.length} Logbook berhasil divalidasi!\`);
        fetchData();
      } else {
        alert("Gagal memvalidasi logbook");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

`;

content = content.replace('const toggleSelectLog = (id) => {', handlers + 'const toggleSelectLog = (id) => {');

// 2. Change the button group logic
// Old logic:
// {subGroup.logs.some(l => l.status_validasi === 'menunggu_dpl' || l.status_validasi === 'menunggu_mentor') && (
//   <button onClick={() => handleSelectSubGroup(subGroup.logs)} ...> Pilih Semua di Grup Ini </button>
// )}
const oldButtonLogic = `{subGroup.logs.some(l => l.status_validasi === 'menunggu_dpl' || l.status_validasi === 'menunggu_mentor') && (
                                    <button 
                                      onClick={() => handleSelectSubGroup(subGroup.logs)}
                                      className="text-xs font-bold px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Pilih Semua di Grup Ini
                                    </button>
                                  )}`;

const newButtonLogic = `{activeTab === 'antrean' && subGroup.logs.some(l => l.status_validasi === 'menunggu_dpl') && (
                                    <button 
                                      onClick={() => handleSelectSubGroup(subGroup.logs)}
                                      className="text-xs font-bold px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Pilih Semua di Grup Ini
                                    </button>
                                  )}
                                  
                                  {activeTab === 'histori' && subGroup.logs.some(l => l.status_validasi === 'menunggu_mentor') && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleCopyLinkMentor(subGroup.logs)}
                                        disabled={submitting}
                                        className="text-xs font-bold px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Copy className="w-3.5 h-3.5" /> Copy Link
                                      </button>
                                      <button 
                                        onClick={() => handleForceValidate(subGroup.logs)}
                                        disabled={submitting}
                                        className="text-xs font-bold px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Bantu Validasi
                                      </button>
                                    </div>
                                  )}`;
content = content.replace(oldButtonLogic, newButtonLogic);

// 3. Remove checkbox rendering from history tab
const oldCheckboxLogic = `{(log.status_validasi === 'menunggu_dpl' || log.status_validasi === 'menunggu_mentor') && (
                                              <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 mt-0.5 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleSelectLog(log._id)}
                                              />
                                            )}`;
const newCheckboxLogic = `{activeTab === 'antrean' && log.status_validasi === 'menunggu_dpl' && (
                                              <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 mt-0.5 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => toggleSelectLog(log._id)}
                                              />
                                            )}`;
content = content.replace(oldCheckboxLogic, newCheckboxLogic);

// Ensure the replace worked or throw error to debug
if (content.indexOf("handleForceValidate") === -1) {
  console.log("Failed to inject handlers");
}
if (content.indexOf("Bantu Validasi") === -1) {
  console.log("Failed to replace button logic");
}

fs.writeFileSync(path, content);
